"""Small shared helpers: role-based access control."""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from .extensions import db
from .models import User


def current_user():
    """Return the User row for whoever's token is on the request (or None)."""
    identity = get_jwt_identity()
    if identity is None:
        return None
    return db.session.get(User, int(identity))


def admin_required(fn):
    """Route decorator: only allow a logged-in user whose role is 'admin'."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        actor = current_user()
        if not actor or actor.role != "admin":
            return jsonify({"message": "Admins only."}), 403
        return fn(*args, **kwargs)
    return wrapper
