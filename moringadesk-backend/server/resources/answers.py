"""Answers (replies / suggested solutions) routes.

Creating an answer is where most of the notification logic lives: the
question owner is told someone replied, and everyone following the question
is told a new answer landed (without double-notifying the owner or the
person who just answered).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Answer, Problem
from ..utils import current_user, raise_notification

answers_bp = Blueprint("answers", __name__, url_prefix="/answers")


@answers_bp.get("")
def list_answers():
    # /answers  or  /answers?problemId=3
    problem_id = request.args.get("problemId", type=int)
    query = Answer.query
    if problem_id is not None:
        query = query.filter_by(problem_id=problem_id)
    answers = query.order_by(Answer.created_at.asc()).all()
    return jsonify([a.to_dict() for a in answers]), 200


@answers_bp.post("")
@jwt_required()
def create_answer():
    data = request.get_json() or {}
    actor = current_user()

    problem = db.session.get(Problem, data.get("problemId"))
    if not problem:
        return jsonify({"message": "Problem not found."}), 404
    if not (data.get("body") or "").strip():
        return jsonify({"message": "An answer body is required."}), 400

    answer = Answer(
        problem_id=problem.id,
        user_id=actor.id if actor else data.get("userId"),
        body=data["body"].strip(),
        votes=data.get("votes", 0),
    )
    db.session.add(answer)

    # --- raise notifications (MVP requirement) ---
    recipients = {}
    if actor and actor.id != problem.user_id:
        recipients[problem.user_id] = (
            "answer", f'{actor.name} replied to your question "{problem.title}"'
        )
    for follower in problem.followers:
        if actor and follower.id == actor.id:
            continue
        if follower.id == problem.user_id or follower.id in recipients:
            continue
        recipients[follower.id] = (
            "follow_response",
            f'A new answer was posted on "{problem.title}", which you follow',
        )
    for uid, (ntype, message) in recipients.items():
        raise_notification(uid, ntype, message)

    db.session.commit()
    return jsonify(answer.to_dict()), 201


@answers_bp.patch("/<int:answer_id>")
@jwt_required()
def update_answer(answer_id):
    answer = db.session.get(Answer, answer_id)
    if not answer:
        return jsonify({"message": "Answer not found."}), 404

    data = request.get_json() or {}
    actor = current_user()

    if "votes" in data:
        answer.votes = data["votes"]
        if actor and actor.id != answer.user_id:
            raise_notification(answer.user_id, "vote", f"{actor.name} voted on your answer")
    if "flagged" in data:
        answer.flagged = data["flagged"]
    if "body" in data:
        answer.body = data["body"]

    db.session.commit()
    return jsonify(answer.to_dict()), 200


@answers_bp.delete("/<int:answer_id>")
@jwt_required()
def delete_answer(answer_id):
    answer = db.session.get(Answer, answer_id)
    if not answer:
        return jsonify({"message": "Answer not found."}), 404

    actor = current_user()
    if actor.role != "admin" and actor.id != answer.user_id:
        return jsonify({"message": "Not allowed."}), 403

    db.session.delete(answer)
    db.session.commit()
    return jsonify({}), 200
