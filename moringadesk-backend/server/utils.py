"""Small shared helpers: role-based access control and notifications."""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request

from .extensions import db
from .models import Notification, User


def admin_required(fn):
    """Route decorator: only allow users whose JWT says role == 'admin'.

    Used on admin-only endpoints (managing users, deleting content,
    reports). It relies on the 'role' claim we put inside the token at
    login time (see resources/auth.py).
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"message": "Admins only."}), 403
        return fn(*args, **kwargs)
    return wrapper


def current_user():
    """Return the User row for whoever's token is on the request (or None)."""
    from flask_jwt_extended import get_jwt_identity
    identity = get_jwt_identity()
    if identity is None:
        return None
    return db.session.get(User, int(identity))


def raise_notification(user_id, ntype, message):
    """Create + save a notification for a user.

    This is how the backend satisfies the MVP requirement to raise
    notifications for (1) a vote on your question/answer, (2) an answer on
    your question, and (3) a response on a question you follow. Callers use
    it as a side effect after the main write succeeds.
    """
    note = Notification(user_id=user_id, type=ntype, message=message, read=False)
    db.session.add(note)
    return note
