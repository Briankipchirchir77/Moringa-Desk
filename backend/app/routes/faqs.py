from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Faq

faqs_bp = Blueprint("faqs", __name__)

SIMPLE_FIELDS = {"category": "category", "question": "question", "answer": "answer"}


@faqs_bp.get("")
def list_faqs():
    query = Faq.query
    category = request.args.get("category")
    if category:
        query = query.filter_by(category=category)
    return jsonify([f.to_dict() for f in query.order_by(Faq.id).all()])


@faqs_bp.post("")
def create_faq():
    data = request.get_json(silent=True) or {}
    if not data.get("question") or not data.get("answer"):
        return jsonify({"message": "question and answer are required."}), 400
    faq = Faq(
        category=data.get("category", "General"),
        question=data["question"],
        answer=data["answer"],
    )
    db.session.add(faq)
    db.session.commit()
    return jsonify(faq.to_dict()), 201


@faqs_bp.patch("/<int:faq_id>")
def update_faq(faq_id):
    faq = Faq.query.get(faq_id)
    if not faq:
        return jsonify({"message": "FAQ not found."}), 404
    data = request.get_json(silent=True) or {}
    for json_key, attr in SIMPLE_FIELDS.items():
        if json_key in data:
            setattr(faq, attr, data[json_key])
    db.session.commit()
    return jsonify(faq.to_dict())


@faqs_bp.delete("/<int:faq_id>")
def delete_faq(faq_id):
    faq = Faq.query.get(faq_id)
    if not faq:
        return jsonify({"message": "FAQ not found."}), 404
    db.session.delete(faq)
    db.session.commit()
    return "", 204
