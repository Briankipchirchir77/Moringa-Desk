"""Authentication: register + login, returning a JWT.

The response shape is {"token": "...", "user": {...}} to match exactly what
the frontend's auth slice already expects (it previously faked this shape
client-side against json-server).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from ..extensions import db
from ..models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


def _issue_token(user):
    """Create a signed JWT that carries the user's id and role."""
    return create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role},
    )


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    cohort = data.get("cohort")

    if not name or not email or not password:
        return jsonify({"message": "name, email and password are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "An account with that email already exists."}), 409

    user = User(name=name, email=email, role="student", cohort=cohort)
    user.set_password(password)  # hashes it — we never store the raw password
    db.session.add(user)
    db.session.commit()

    return jsonify({"token": _issue_token(user), "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password."}), 401

    return jsonify({"token": _issue_token(user), "user": user.to_dict()}), 200
