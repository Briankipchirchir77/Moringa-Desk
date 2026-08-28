from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Problem, Tag, User

problems_bp = Blueprint("problems", __name__)

SIMPLE_FIELDS = {
    "title": "title",
    "body": "body",
    "votes": "votes",
    "views": "views",
    "flagged": "flagged",
    "solvedAnswerId": "solved_answer_id",
}


def apply_patch(problem, data):
    for json_key, attr in SIMPLE_FIELDS.items():
        if json_key in data:
            setattr(problem, attr, data[json_key])
    if "tagIds" in data:
        problem.tags = Tag.query.filter(Tag.id.in_(data["tagIds"])).all()
    if "followerIds" in data:
        problem.followers = User.query.filter(User.id.in_(data["followerIds"])).all()


@problems_bp.get("")
def list_problems():
    return jsonify([p.to_dict() for p in Problem.query.order_by(Problem.created_at.desc()).all()])


@problems_bp.get("/<int:problem_id>")
def get_problem(problem_id):
    problem = Problem.query.get(problem_id)
    if not problem:
        return jsonify({"message": "Question not found."}), 404
    return jsonify(problem.to_dict())


@problems_bp.post("")
@jwt_required()
def create_problem():
    data = request.get_json(silent=True) or {}
    if not data.get("title") or not data.get("body"):
        return jsonify({"message": "Title and body are required."}), 400

    problem = Problem(
        title=data["title"],
        body=data["body"],
        user_id=int(get_jwt_identity()),
        votes=0,
        views=0,
    )
    apply_patch(problem, data)
    db.session.add(problem)
    db.session.commit()
    return jsonify(problem.to_dict()), 201


@problems_bp.patch("/<int:problem_id>")
@jwt_required()
def update_problem(problem_id):
    problem = Problem.query.get(problem_id)
    if not problem:
        return jsonify({"message": "Question not found."}), 404
    apply_patch(problem, request.get_json(silent=True) or {})
    db.session.commit()
    return jsonify(problem.to_dict())


@problems_bp.delete("/<int:problem_id>")
@jwt_required()
def delete_problem(problem_id):
    problem = Problem.query.get(problem_id)
    if not problem:
        return jsonify({"message": "Question not found."}), 404
    db.session.delete(problem)
    db.session.commit()
    return "", 204
