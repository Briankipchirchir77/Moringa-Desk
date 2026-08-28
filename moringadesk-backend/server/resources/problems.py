"""Problems (questions) routes.

Covers: list, view one, ask a new one, patch it (vote / follow / mark the
accepted solution / flag / edit), and delete. PATCH mirrors how the
frontend already talks to json-server: it sends a small partial body and
expects the full updated record back.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Problem, Answer, Tag, User
from ..utils import current_user, raise_notification, admin_required

problems_bp = Blueprint("problems", __name__, url_prefix="/problems")


def _apply_tag_ids(problem, tag_ids):
    problem.tags = Tag.query.filter(Tag.id.in_(tag_ids)).all() if tag_ids else []


def _apply_follower_ids(problem, follower_ids):
    problem.followers = User.query.filter(User.id.in_(follower_ids)).all() if follower_ids else []


@problems_bp.get("")
def list_problems():
    # Optional filters so students can browse by tag/category (?category=..&tagId=..)
    query = Problem.query
    category = request.args.get("category")
    if category:
        query = query.filter_by(category=category)
    problems = query.order_by(Problem.created_at.desc()).all()

    tag_id = request.args.get("tagId", type=int)
    result = [p.to_dict() for p in problems]
    if tag_id:
        result = [p for p in result if tag_id in p["tagIds"]]
    return jsonify(result), 200


@problems_bp.get("/<int:problem_id>")
def get_problem(problem_id):
    problem = db.session.get(Problem, problem_id)
    if not problem:
        return jsonify({"message": "Problem not found."}), 404
    return jsonify(problem.to_dict()), 200


@problems_bp.post("")
@jwt_required()
def create_problem():
    data = request.get_json() or {}
    author = current_user()

    problem = Problem(
        title=(data.get("title") or "").strip(),
        body=(data.get("body") or "").strip(),
        user_id=author.id if author else data.get("userId"),
        category=data.get("category"),
        cohort_stage=data.get("cohortStage"),
        votes=data.get("votes", 0),
        views=data.get("views", 0),
    )
    if not problem.title or not problem.body:
        return jsonify({"message": "title and body are required."}), 400

    _apply_tag_ids(problem, data.get("tagIds", []))
    # the asker follows their own question by default so they get replies
    followers = set(data.get("followerIds", []))
    if author:
        followers.add(author.id)
    _apply_follower_ids(problem, list(followers))

    db.session.add(problem)
    db.session.commit()
    return jsonify(problem.to_dict()), 201


@problems_bp.patch("/<int:problem_id>")
@jwt_required()
def update_problem(problem_id):
    problem = db.session.get(Problem, problem_id)
    if not problem:
        return jsonify({"message": "Problem not found."}), 404

    data = request.get_json() or {}
    actor = current_user()

    # --- vote: raise a notification to the question owner ---
    if "votes" in data:
        problem.votes = data["votes"]
        if actor and actor.id != problem.user_id:
            raise_notification(
                problem.user_id, "vote",
                f'{actor.name} voted on your question "{problem.title}"',
            )

    # --- follow / unfollow: just replace the follower list ---
    if "followerIds" in data:
        _apply_follower_ids(problem, data["followerIds"])

    # --- mark accepted solution: notify the answer's author ---
    if "solvedAnswerId" in data:
        problem.solved_answer_id = data["solvedAnswerId"]
        answer = db.session.get(Answer, data["solvedAnswerId"]) if data["solvedAnswerId"] else None
        if answer and actor and answer.user_id != actor.id:
            raise_notification(
                answer.user_id, "answer",
                f'Your answer was marked as the solution on "{problem.title}"',
            )

    # --- moderation + plain edits ---
    if "flagged" in data:
        problem.flagged = data["flagged"]
    if "title" in data:
        problem.title = data["title"]
    if "body" in data:
        problem.body = data["body"]
    if "category" in data:
        problem.category = data["category"]
    if "cohortStage" in data:
        problem.cohort_stage = data["cohortStage"]
    if "tagIds" in data:
        _apply_tag_ids(problem, data["tagIds"])

    db.session.commit()
    return jsonify(problem.to_dict()), 200


@problems_bp.delete("/<int:problem_id>")
@jwt_required()
def delete_problem(problem_id):
    problem = db.session.get(Problem, problem_id)
    if not problem:
        return jsonify({"message": "Problem not found."}), 404

    actor = current_user()
    # only the author or an admin may delete
    if actor.role != "admin" and actor.id != problem.user_id:
        return jsonify({"message": "Not allowed."}), 403

    db.session.delete(problem)
    db.session.commit()
    return jsonify({}), 200
