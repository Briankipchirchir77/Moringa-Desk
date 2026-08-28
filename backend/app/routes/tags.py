from flask import Blueprint, jsonify
from ..models import Tag

tags_bp = Blueprint("tags", __name__)


@tags_bp.get("")
def list_tags():
    return jsonify([t.to_dict() for t in Tag.query.order_by(Tag.id).all()])
