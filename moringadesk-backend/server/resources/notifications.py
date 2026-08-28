"""Notification routes: list your notifications, create one, mark one read.

The backend raises notifications automatically (see problems.py / answers.py),
so the POST endpoint here is mainly for completeness/testing. When wiring
this API to the frontend, remove the temporary client-side createNotification
dispatches in answersApi.js / problemsApi.js so notifications aren't created
twice — they were only a stand-in until this backend existed.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Notification

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    # /notifications?userId=3  (already sorted newest-first for the feed)
    user_id = request.args.get("userId", type=int)
    query = Notification.query
    if user_id is not None:
        query = query.filter_by(user_id=user_id)
    notes = query.order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notes]), 200


@notifications_bp.post("")
@jwt_required()
def create_notification():
    data = request.get_json() or {}
    if not data.get("userId") or not data.get("message"):
        return jsonify({"message": "userId and message are required."}), 400
    note = Notification(
        user_id=data["userId"],
        type=data.get("type", "info"),
        message=data["message"],
        read=data.get("read", False),
    )
    db.session.add(note)
    db.session.commit()
    return jsonify(note.to_dict()), 201


@notifications_bp.patch("/<int:notification_id>")
@jwt_required()
def update_notification(notification_id):
    note = db.session.get(Notification, notification_id)
    if not note:
        return jsonify({"message": "Notification not found."}), 404
    data = request.get_json() or {}
    if "read" in data:
        note.read = data["read"]
    db.session.commit()
    return jsonify(note.to_dict()), 200
