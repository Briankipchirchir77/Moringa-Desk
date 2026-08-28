import os
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from dotenv import load_dotenv
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

problem_tags = db.Table(
    "problem_tags",
    db.Column("problem_id", db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

problem_followers = db.Table(
    "problem_followers",
    db.Column("problem_id", db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")
    cohort = db.Column(db.String(120))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    problems = db.relationship("Problem", back_populates="author", cascade="all, delete-orphan")
    answers = db.relationship("Answer", back_populates="author", cascade="all, delete-orphan")

    def public_dict(self):
        return {"id": str(self.id), "name": self.name, "email": self.email, "role": self.role, "cohort": self.cohort}


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False, index=True)

    def to_dict(self):
        return {"id": str(self.id), "name": self.name}


class Problem(db.Model):
    __tablename__ = "problems"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    votes = db.Column(db.Integer, nullable=False, default=0)
    views = db.Column(db.Integer, nullable=False, default=0)
    solved_answer_id = db.Column(db.Integer, db.ForeignKey("answers.id", ondelete="SET NULL"))
    flagged = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    author = db.relationship("User", back_populates="problems", foreign_keys=[user_id])
    answers = db.relationship("Answer", back_populates="problem", foreign_keys="Answer.problem_id", cascade="all, delete-orphan")
    solved_answer = db.relationship("Answer", foreign_keys=[solved_answer_id], post_update=True)
    tags = db.relationship("Tag", secondary=problem_tags, backref="problems")
    followers = db.relationship("User", secondary=problem_followers, backref="followed_problems")

    def to_dict(self):
        return {
            "id": str(self.id), "title": self.title, "body": self.body, "userId": str(self.user_id),
            "votes": self.votes, "views": self.views, "solvedAnswerId": str(self.solved_answer_id) if self.solved_answer_id else None,
            "flagged": self.flagged, "createdAt": self.created_at.isoformat(), "tagIds": [str(tag.id) for tag in self.tags],
            "followerIds": [str(user.id) for user in self.followers],
        }


class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    votes = db.Column(db.Integer, nullable=False, default=0)
    flagged = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    problem = db.relationship("Problem", back_populates="answers", foreign_keys=[problem_id])
    author = db.relationship("User", back_populates="answers")

    def to_dict(self):
        return {
            "id": str(self.id), "problemId": str(self.problem_id), "userId": str(self.user_id), "body": self.body,
            "votes": self.votes, "flagged": self.flagged, "createdAt": self.created_at.isoformat(),
        }


class Faq(db.Model):
    __tablename__ = "faqs"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(80), nullable=False)
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {"id": str(self.id), "category": self.category, "question": self.question, "answer": self.answer}


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = db.Column(db.String(40), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {"id": str(self.id), "userId": str(self.user_id), "type": self.type, "message": self.message, "read": self.read, "createdAt": self.created_at.isoformat()}


def json_error(message, status):
    return jsonify({"message": message}), status


def current_user():
    identity = get_jwt_identity()
    return db.session.get(User, int(identity)) if identity else None


def admin_required(view):
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user = current_user()
        if not user or user.role != "admin":
            return json_error("Admin access required.", 403)
        return view(*args, **kwargs)
    return wrapped


def owner_or_admin(user_id):
    user = current_user()
    return user and (user.role == "admin" or user.id == user_id)


def get_payload():
    return request.get_json(silent=True) or {}


def find_tags(tag_ids):
    tags = []
    for raw_id in tag_ids or []:
        tag = db.session.get(Tag, int(raw_id))
        if not tag:
            return None
        tags.append(tag)
    return tags


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", "sqlite:///moringa_desk.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY", "change-this-in-production"),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=8),
    )
    if test_config:
        app.config.update(test_config)
    CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "*")}})
    db.init_app(app)
    jwt.init_app(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "moringa-desk-api"})

    @app.post("/api/auth/register")
    def register():
        payload = get_payload()
        name = payload.get("name", "").strip()
        email = payload.get("email", "").strip().lower()
        password = payload.get("password", "")
        if not name or not email or len(password) < 8:
            return json_error("Name, email, and a password of at least 8 characters are required.", 400)
        if User.query.filter_by(email=email).first():
            return json_error("An account with that email already exists.", 409)
        user = User(name=name, email=email, password_hash=generate_password_hash(password), role="student", cohort=payload.get("cohort"))
        db.session.add(user)
        db.session.commit()
        return jsonify({"user": user.public_dict(), "token": create_access_token(identity=str(user.id))}), 201

    @app.post("/api/auth/login")
    def login():
        payload = get_payload()
        user = User.query.filter_by(email=payload.get("email", "").strip().lower()).first()
        if not user or not check_password_hash(user.password_hash, payload.get("password", "")):
            return json_error("Invalid email or password.", 401)
        return jsonify({"user": user.public_dict(), "token": create_access_token(identity=str(user.id))})

    @app.get("/api/users/me")
    @jwt_required()
    def me():
        user = current_user()
        return jsonify(user.public_dict()) if user else json_error("Not authenticated.", 401)

    @app.put("/api/users/me")
    @jwt_required()
    def update_me():
        user = current_user()
        if not user:
            return json_error("Not authenticated.", 401)
        payload = get_payload()
        if "name" in payload:
            name = payload["name"].strip()
            if not name:
                return json_error("Name cannot be empty.", 400)
            user.name = name
        if "cohort" in payload:
            user.cohort = payload["cohort"]
        db.session.commit()
        return jsonify(user.public_dict())

    @app.get("/api/users")
    def users():
        return jsonify([user.public_dict() for user in User.query.order_by(User.name).all()])

    @app.get("/api/users/<int:user_id>")
    @jwt_required()
    def user_detail(user_id):
        user = db.session.get(User, user_id)
        return jsonify(user.public_dict()) if user else json_error("User not found.", 404)

    @app.patch("/api/users/<int:user_id>")
    @admin_required
    def update_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return json_error("User not found.", 404)
        payload = get_payload()
        for field in ("name", "role", "cohort"):
            if field in payload:
                setattr(user, field, payload[field])
        db.session.commit()
        return jsonify(user.public_dict())

    @app.delete("/api/users/<int:user_id>")
    @admin_required
    def delete_user(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return json_error("User not found.", 404)
        db.session.delete(user)
        db.session.commit()
        return "", 204

    @app.get("/api/problems")
    def problems():
        query = Problem.query.order_by(Problem.created_at.desc())
        search = request.args.get("search")
        if search:
            query = query.filter(or_(Problem.title.ilike(f"%{search}%"), Problem.body.ilike(f"%{search}%")))
        return jsonify([problem.to_dict() for problem in query.all()])

    @app.get("/api/problems/<int:problem_id>")
    def problem_detail(problem_id):
        problem = db.session.get(Problem, problem_id)
        if not problem:
            return json_error("Question not found.", 404)
        problem.views += 1
        db.session.commit()
        return jsonify(problem.to_dict())

    @app.post("/api/problems")
    @jwt_required()
    def create_problem():
        payload = get_payload()
        if not payload.get("title") or not payload.get("body"):
            return json_error("Title and body are required.", 400)
        tags = find_tags(payload.get("tagIds", []))
        if tags is None:
            return json_error("One or more tags were not found.", 400)
        problem = Problem(title=payload["title"].strip(), body=payload["body"].strip(), user_id=int(get_jwt_identity()), tags=tags)
        db.session.add(problem)
        db.session.commit()
        return jsonify(problem.to_dict()), 201

    @app.patch("/api/problems/<int:problem_id>")
    @jwt_required()
    def update_problem(problem_id):
        problem = db.session.get(Problem, problem_id)
        payload = get_payload()
        if not problem:
            return json_error("Question not found.", 404)
        owner_fields = {"title", "body", "tagIds", "solvedAnswerId"}
        if owner_fields.intersection(payload) and not owner_or_admin(problem.user_id):
            return json_error("You do not have permission to update this question.", 403)
        for field in ("title", "body", "votes", "views", "solvedAnswerId", "flagged"):
            if field in payload:
                setattr(problem, {"solvedAnswerId": "solved_answer_id"}.get(field, field), payload[field])
        if "tagIds" in payload:
            tags = find_tags(payload["tagIds"])
            if tags is None:
                return json_error("One or more tags were not found.", 400)
            problem.tags = tags
        if "followerIds" in payload:
            followers = [db.session.get(User, int(user_id)) for user_id in payload["followerIds"]]
            if any(user is None for user in followers):
                return json_error("One or more followers were not found.", 400)
            problem.followers = followers
        db.session.commit()
        return jsonify(problem.to_dict())

    @app.delete("/api/problems/<int:problem_id>")
    @jwt_required()
    def delete_problem(problem_id):
        problem = db.session.get(Problem, problem_id)
        if not problem:
            return json_error("Question not found.", 404)
        if not owner_or_admin(problem.user_id):
            return json_error("You do not have permission to delete this question.", 403)
        db.session.delete(problem)
        db.session.commit()
        return "", 204

    @app.get("/api/answers")
    def answers():
        query = Answer.query.order_by(Answer.created_at.asc())
        if request.args.get("problemId"):
            query = query.filter_by(problem_id=int(request.args["problemId"]))
        return jsonify([answer.to_dict() for answer in query.all()])

    @app.post("/api/answers")
    @jwt_required()
    def create_answer():
        payload = get_payload()
        problem = db.session.get(Problem, payload.get("problemId"))
        if not problem or not payload.get("body"):
            return json_error("A valid problem and answer body are required.", 400)
        answer = Answer(problem_id=problem.id, user_id=int(get_jwt_identity()), body=payload["body"].strip())
        db.session.add(answer)
        db.session.commit()
        return jsonify(answer.to_dict()), 201

    @app.patch("/api/answers/<int:answer_id>")
    @jwt_required()
    def update_answer(answer_id):
        answer = db.session.get(Answer, answer_id)
        if not answer:
            return json_error("Answer not found.", 404)
        if any(field in get_payload() for field in ("body",)) and not owner_or_admin(answer.user_id):
            return json_error("You do not have permission to update this answer.", 403)
        payload = get_payload()
        for field in ("body", "votes", "flagged"):
            if field in payload:
                setattr(answer, field, payload[field])
        db.session.commit()
        return jsonify(answer.to_dict())

    @app.delete("/api/answers/<int:answer_id>")
    @jwt_required()
    def delete_answer(answer_id):
        answer = db.session.get(Answer, answer_id)
        if not answer:
            return json_error("Answer not found.", 404)
        if not owner_or_admin(answer.user_id):
            return json_error("You do not have permission to delete this answer.", 403)
        db.session.delete(answer)
        db.session.commit()
        return "", 204

    @app.get("/api/tags")
    def tags():
        return jsonify([tag.to_dict() for tag in Tag.query.order_by(Tag.name).all()])

    @app.get("/api/faqs")
    def faqs():
        query = Faq.query
        if request.args.get("category"):
            query = query.filter_by(category=request.args["category"])
        return jsonify([faq.to_dict() for faq in query.order_by(Faq.category).all()])

    @app.post("/api/faqs")
    @admin_required
    def create_faq():
        payload = get_payload()
        faq = Faq(category=payload.get("category", "General"), question=payload.get("question", "").strip(), answer=payload.get("answer", "").strip())
        if not faq.question or not faq.answer:
            return json_error("Question and answer are required.", 400)
        db.session.add(faq)
        db.session.commit()
        return jsonify(faq.to_dict()), 201

    @app.patch("/api/faqs/<int:faq_id>")
    @admin_required
    def update_faq(faq_id):
        faq = db.session.get(Faq, faq_id)
        if not faq:
            return json_error("FAQ not found.", 404)
        payload = get_payload()
        for field in ("category", "question", "answer"):
            if field in payload:
                setattr(faq, field, payload[field])
        db.session.commit()
        return jsonify(faq.to_dict())

    @app.delete("/api/faqs/<int:faq_id>")
    @admin_required
    def delete_faq(faq_id):
        faq = db.session.get(Faq, faq_id)
        if not faq:
            return json_error("FAQ not found.", 404)
        db.session.delete(faq)
        db.session.commit()
        return "", 204

    @app.get("/api/notifications")
    @jwt_required()
    def notifications():
        user_id = request.args.get("userId", get_jwt_identity())
        if str(user_id) != str(get_jwt_identity()) and current_user().role != "admin":
            return json_error("You can only view your own notifications.", 403)
        items = Notification.query.filter_by(user_id=int(user_id)).order_by(Notification.created_at.desc()).all()
        return jsonify([item.to_dict() for item in items])

    @app.post("/api/notifications")
    @jwt_required()
    def create_notification():
        payload = get_payload()
        notification = Notification(user_id=int(payload["userId"]), type=payload.get("type", "system"), message=payload.get("message", ""), read=payload.get("read", False))
        db.session.add(notification)
        db.session.commit()
        return jsonify(notification.to_dict()), 201

    @app.patch("/api/notifications/<int:notification_id>")
    @jwt_required()
    def update_notification(notification_id):
        notification = db.session.get(Notification, notification_id)
        if not notification:
            return json_error("Notification not found.", 404)
        if not owner_or_admin(notification.user_id):
            return json_error("You do not have permission to update this notification.", 403)
        notification.read = get_payload().get("read", notification.read)
        db.session.commit()
        return jsonify(notification.to_dict())

    @app.errorhandler(400)
    def bad_request(_error):
        return json_error("The request could not be understood.", 400)

    @app.errorhandler(404)
    def not_found(_error):
        return json_error("Resource not found.", 404)

    @app.errorhandler(500)
    def server_error(_error):
        db.session.rollback()
        return json_error("An unexpected server error occurred.", 500)

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG", "0") == "1")
