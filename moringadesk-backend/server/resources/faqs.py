"""FAQ routes. Reading is public; creating/updating/deleting is admin-only."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Faq
from ..utils import admin_required

faqs_bp = Blueprint("faqs", __name__, url_prefix="/faqs")


@faqs_bp.get("")
def list_faqs():
    category = request.args.get("category")
    query = Faq.query
    if category and category != "All":
        query = query.filter_by(category=category)
    return jsonify([f.to_dict() for f in query.all()]), 200


@faqs_bp.post("")
@admin_required
def create_faq():
    data = request.get_json() or {}
    if not (data.get("question") and data.get("answer")):
        return jsonify({"message": "question and answer are required."}), 400
    faq = Faq(question=data["question"], answer=data["answer"], category=data.get("category"))
    db.session.add(faq)
    db.session.commit()
    return jsonify(faq.to_dict()), 201


@faqs_bp.patch("/<int:faq_id>")
@admin_required
def update_faq(faq_id):
    faq = db.session.get(Faq, faq_id)
    if not faq:
        return jsonify({"message": "FAQ not found."}), 404
    data = request.get_json() or {}
    for field in ("question", "answer", "category"):
        if field in data:
            setattr(faq, field, data[field])
    db.session.commit()
    return jsonify(faq.to_dict()), 200


@faqs_bp.delete("/<int:faq_id>")
@admin_required
def delete_faq(faq_id):
    faq = db.session.get(Faq, faq_id)
    if not faq:
        return jsonify({"message": "FAQ not found."}), 404
    db.session.delete(faq)
    db.session.commit()
    return jsonify({}), 200
