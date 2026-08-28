"""Tag routes: list tags (public), create a tag (admin)."""
from flask import Blueprint, request, jsonify

from ..extensions import db
from ..models import Tag
from ..utils import admin_required

tags_bp = Blueprint("tags", __name__, url_prefix="/tags")


@tags_bp.get("")
def list_tags():
    return jsonify([t.to_dict() for t in Tag.query.order_by(Tag.name).all()]), 200


@tags_bp.post("")
@admin_required
def create_tag():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"message": "name is required."}), 400
    if Tag.query.filter_by(name=name).first():
        return jsonify({"message": "Tag already exists."}), 409
    tag = Tag(name=name)
    db.session.add(tag)
    db.session.commit()
    return jsonify(tag.to_dict()), 201
