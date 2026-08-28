from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Answer

answers_bp = Blueprint("answers", __name__)

SIMPLE_FIELDS = {"body": "body", "votes": "votes", "flagged": "flagged"}


@answers_bp.get("")
def list_answers():
    query = Answer.query
    problem_id = request.args.get("problemId")
    if problem_id:
        query = query.filter_by(problem_id=problem_id)
    return jsonify([a.to_dict() for a in query.order_by(Answer.created_at).all()])


@answers_bp.post("")
@jwt_required()
def create_answer():
    data = request.get_json(silent=True) or {}
    if not data.get("problemId") or not data.get("body"):
        return jsonify({"message": "problemId and body are required."}), 400

    answer = Answer(
        problem_id=data["problemId"],
        user_id=int(get_jwt_identity()),
        body=data["body"],
        votes=0,
    )
    db.session.add(answer)
    db.session.commit()
    return jsonify(answer.to_dict()), 201


@answers_bp.patch("/<int:answer_id>")
@jwt_required()
def update_answer(answer_id):
    answer = Answer.query.get(answer_id)
    if not answer:
        return jsonify({"message": "Answer not found."}), 404
    data = request.get_json(silent=True) or {}
    for json_key, attr in SIMPLE_FIELDS.items():
        if json_key in data:
            setattr(answer, attr, data[json_key])
    db.session.commit()
    return jsonify(answer.to_dict())


@answers_bp.delete("/<int:answer_id>")
@jwt_required()
def delete_answer(answer_id):
    answer = Answer.query.get(answer_id)
    if not answer:
        return jsonify({"message": "Answer not found."}), 404
    db.session.delete(answer)
    db.session.commit()
    return "", 204
