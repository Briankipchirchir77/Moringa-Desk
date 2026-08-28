"""User routes.

Listing/viewing users never exposes password hashes. Editing a user is
allowed for that same user (e.g. update their own profile) or an admin;
deleting a user is admin-only (the 'manage all user accounts' admin story).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import User
from ..utils import current_user, admin_required

users_bp = Blueprint("users", __name__, url_prefix="/users")


@users_bp.get("")
def list_users():
    return jsonify([u.to_dict() for u in User.query.all()]), 200


@users_bp.get("/<int:user_id>")
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify(user.to_dict()), 200


@users_bp.patch("/<int:user_id>")
@jwt_required()
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    actor = current_user()
    if actor.role != "admin" and actor.id != user.id:
        return jsonify({"message": "Not allowed."}), 403

    data = request.get_json() or {}
    if "name" in data:
        user.name = data["name"]
    if "cohort" in data:
        user.cohort = data["cohort"]
    if "password" in data and data["password"]:
        user.set_password(data["password"])
    # only an admin may change someone's role
    if "role" in data and actor.role == "admin":
        user.role = data["role"]

    db.session.commit()
    return jsonify(user.to_dict()), 200


@users_bp.delete("/<int:user_id>")
@admin_required
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({}), 200
