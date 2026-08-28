"""Database models for MoringaDesk.

Every model has a to_dict() that serialises it into the EXACT camelCase
JSON shape the React/Redux frontend already expects (userId, problemId,
tagIds, followerIds, solvedAnswerId, cohortStage, createdAt, ...), so the
frontend works against this API with no changes to its field names.
"""
from datetime import datetime, timezone

from .extensions import db, bcrypt


def _now():
    return datetime.now(timezone.utc)


def _iso(dt):
    """Serialise a datetime as an ISO-8601 string (or None)."""
    return dt.isoformat() if dt else None


# --- Association tables (many-to-many links) -------------------------------

# Which tags are attached to which problems (Language, Stage, Logical, ...)
problem_tags = db.Table(
    "problem_tags",
    db.Column("problem_id", db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

# Which users follow (are subscribed to) which problems
problem_followers = db.Table(
    "problem_followers",
    db.Column("problem_id", db.Integer, db.ForeignKey("problems.id", ondelete="CASCADE"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


# --- User -------------------------------------------------------------------

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")  # 'student' | 'admin'
    cohort = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=_now)

    problems = db.relationship("Problem", backref="author", lazy=True, cascade="all, delete-orphan")
    answers = db.relationship("Answer", backref="author", lazy=True, cascade="all, delete-orphan")

    # --- password helpers ---
    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def to_dict(self, include_email=True):
        """Public shape — never includes the password hash."""
        data = {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "cohort": self.cohort,
            "createdAt": _iso(self.created_at),
        }
        if include_email:
            data["email"] = self.email
        return data


# --- Tag --------------------------------------------------------------------

class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name}


# --- Problem (a question) ---------------------------------------------------

class Problem(db.Model):
    __tablename__ = "problems"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    votes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    category = db.Column(db.String(80), nullable=True)
    cohort_stage = db.Column(db.String(80), nullable=True)
    flagged = db.Column(db.Boolean, default=False)
    # the answer the asker accepted as the solution (nullable)
    solved_answer_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=_now)

    tags = db.relationship("Tag", secondary=problem_tags, backref="problems", lazy="subquery")
    followers = db.relationship("User", secondary=problem_followers, backref="followed_problems", lazy="subquery")
    answers = db.relationship("Answer", backref="problem", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "userId": self.user_id,
            "tagIds": [t.id for t in self.tags],
            "followerIds": [u.id for u in self.followers],
            "solvedAnswerId": self.solved_answer_id,
            "votes": self.votes or 0,
            "views": self.views or 0,
            "category": self.category,
            "cohortStage": self.cohort_stage,
            "flagged": self.flagged,
            "createdAt": _iso(self.created_at),
        }


# --- Answer (a reply / suggested solution) ---------------------------------

class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey("problems.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    votes = db.Column(db.Integer, default=0)
    flagged = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=_now)

    def to_dict(self):
        return {
            "id": self.id,
            "problemId": self.problem_id,
            "userId": self.user_id,
            "body": self.body,
            "votes": self.votes or 0,
            "flagged": self.flagged,
            "createdAt": _iso(self.created_at),
        }


# --- FAQ --------------------------------------------------------------------

class Faq(db.Model):
    __tablename__ = "faqs"

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "answer": self.answer,
            "category": self.category,
        }


# --- Notification -----------------------------------------------------------

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = db.Column(db.String(40), nullable=False)      # 'vote' | 'answer' | 'follow_response'
    message = db.Column(db.String(500), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=_now)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "type": self.type,
            "message": self.message,
            "read": self.read,
            "createdAt": _iso(self.created_at),
        }
