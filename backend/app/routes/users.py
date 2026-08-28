from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User

users_bp = Blueprint("users", __name__)

ALLOWED_SELF_FIELDS = {"name", "cohort"}
ALLOWED_ADMIN_FIELDS = ALLOWED_SELF_FIELDS | {"role"}


@users_bp.get("/me")
@jwt_required()
def get_me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"message": "Not authenticated."}), 401
    return jsonify(user.to_dict())


@users_bp.put("/me")
@jwt_required()
def update_me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"message": "Not authenticated."}), 401
    data = request.get_json(silent=True) or {}
    for field in ALLOWED_SELF_FIELDS:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify(user.to_dict())


@users_bp.get("")
def list_users():
    return jsonify([u.to_dict() for u in User.query.order_by(User.id).all()])


@users_bp.get("/<int:user_id>")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify(user.to_dict())


@users_bp.patch("/<int:user_id>")
@jwt_required()
def update_user(user_id):
    # Admin-only edit of another user's role/cohort/name (used by the
    # admin console); a user editing themself goes through PUT /users/me.
    actor = User.query.get(int(get_jwt_identity()))
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    if not actor or (actor.id != user.id and actor.role != "admin"):
        return jsonify({"message": "Not authorized."}), 403

    data = request.get_json(silent=True) or {}
    fields = ALLOWED_ADMIN_FIELDS if actor.role == "admin" else ALLOWED_SELF_FIELDS
    for field in fields:
        if field in data:
            setattr(user, field, data[field])
    db.session.commit()
    return jsonify(user.to_dict())


@users_bp.delete("/<int:user_id>")
@jwt_required()
def delete_user(user_id):
    actor = User.query.get(int(get_jwt_identity()))
    if not actor or actor.role != "admin":
        return jsonify({"message": "Not authorized."}), 403
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    db.session.delete(user)
    db.session.commit()
    return "", 204
