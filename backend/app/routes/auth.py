from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from ..extensions import db
from ..models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password."}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "token": token})


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = "admin" if data.get("role") == "admin" else "student"

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "An account with that email already exists."}), 409

    user = User(name=name, email=email, role=role, cohort=None)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "token": token}), 201
