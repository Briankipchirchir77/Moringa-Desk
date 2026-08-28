from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Notification

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("")
def list_notifications():
    query = Notification.query
    user_id = request.args.get("userId")
    if user_id:
        query = query.filter_by(user_id=user_id)
    notifications = query.order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications])


@notifications_bp.post("")
def create_notification():
    data = request.get_json(silent=True) or {}
    if not data.get("userId") or not data.get("message"):
        return jsonify({"message": "userId and message are required."}), 400
    notification = Notification(
        user_id=data["userId"],
        type=data.get("type", "system"),
        message=data["message"],
        read=bool(data.get("read", False)),
    )
    db.session.add(notification)
    db.session.commit()
    return jsonify(notification.to_dict()), 201


@notifications_bp.patch("/<int:notification_id>")
def update_notification(notification_id):
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"message": "Notification not found."}), 404
    data = request.get_json(silent=True) or {}
    if "read" in data:
        notification.read = bool(data["read"])
    db.session.commit()
    return jsonify(notification.to_dict())
