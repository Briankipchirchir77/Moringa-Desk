from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from .extensions import db


def utcnow():
    return datetime.now(timezone.utc)


# Many-to-many: which tags apply to which problem
problem_tags = db.Table(
    "problem_tags",
    db.Column("problem_id", db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

# Many-to-many: which users follow which problems
problem_followers = db.Table(
    "problem_followers",
    db.Column("problem_id", db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")  # 'student' | 'admin'
    cohort = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    problems = db.relationship("Problem", back_populates="author", cascade="all, delete-orphan")
    answers = db.relationship("Answer", back_populates="author", cascade="all, delete-orphan")
    notifications = db.relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, raw_password):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "cohort": self.cohort,
        }


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False, unique=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}


class Problem(db.Model):
    __tablename__ = "problems"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    votes = db.Column(db.Integer, nullable=False, default=0)
    views = db.Column(db.Integer, nullable=False, default=0)
    flagged = db.Column(db.Boolean, nullable=False, default=False)
    solved_answer_id = db.Column(
        db.Integer,
        db.ForeignKey("answers.id", use_alter=True, name="fk_solved_answer", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    author = db.relationship("User", back_populates="problems", foreign_keys=[user_id])
    answers = db.relationship(
        "Answer", back_populates="problem", cascade="all, delete-orphan", foreign_keys="Answer.problem_id"
    )
    tags = db.relationship("Tag", secondary=problem_tags, lazy="joined")
    followers = db.relationship("User", secondary=problem_followers, lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "userId": self.user_id,
            "tagIds": [t.id for t in self.tags],
            "votes": self.votes,
            "views": self.views,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "solvedAnswerId": self.solved_answer_id,
            "followerIds": [u.id for u in self.followers],
            "flagged": self.flagged,
        }


class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    votes = db.Column(db.Integer, nullable=False, default=0)
    flagged = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    problem = db.relationship("Problem", back_populates="answers", foreign_keys=[problem_id])
    author = db.relationship("User", back_populates="answers")

    def to_dict(self):
        return {
            "id": self.id,
            "problemId": self.problem_id,
            "userId": self.user_id,
            "body": self.body,
            "votes": self.votes,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "flagged": self.flagged,
        }


class Faq(db.Model):
    __tablename__ = "faqs"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(80), nullable=False)
    question = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "question": self.question,
            "answer": self.answer,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = db.Column(db.String(30), nullable=False)
    message = db.Column(db.Text, nullable=False)
    read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)

    user = db.relationship("User", back_populates="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "type": self.type,
            "message": self.message,
            "read": self.read,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
