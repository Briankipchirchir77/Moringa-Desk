"""Admin reporting / metrics — server-side equivalent of what
AdminReportsPage.jsx currently computes client-side from the plain list
endpoints. Not yet wired into the frontend (which already works without
it), but demonstrates the aggregate-query side of the API and is ready
to swap in if that page is ever moved server-side. Admin-only.
"""
from flask import Blueprint, jsonify
from sqlalchemy import func

from ..extensions import db
from ..models import Problem, Answer, User, Tag, Faq, problem_tags
from ..utils import admin_required

reports_bp = Blueprint("reports", __name__)


@reports_bp.get("/summary")
@admin_required
def summary():
    # most-used tags across all questions
    tag_rows = (
        db.session.query(Tag.name, func.count(problem_tags.c.problem_id))
        .join(problem_tags, problem_tags.c.tag_id == Tag.id)
        .group_by(Tag.id)
        .order_by(func.count(problem_tags.c.problem_id).desc())
        .limit(10)
        .all()
    )
    top_tags = [{"name": name, "count": n} for name, n in tag_rows]

    # top contributors by number of answers
    contributor_rows = (
        db.session.query(User.name, func.count(Answer.id))
        .join(Answer, Answer.user_id == User.id)
        .group_by(User.id)
        .order_by(func.count(Answer.id).desc())
        .limit(5)
        .all()
    )
    top_contributors = [{"name": name, "answers": n} for name, n in contributor_rows]

    total_problems = Problem.query.count()
    solved_problems = Problem.query.filter(Problem.solved_answer_id.isnot(None)).count()

    return jsonify({
        "totals": {
            "users": User.query.count(),
            "problems": total_problems,
            "answers": Answer.query.count(),
            "faqs": Faq.query.count(),
            "flaggedProblems": Problem.query.filter_by(flagged=True).count(),
            "flaggedAnswers": Answer.query.filter_by(flagged=True).count(),
        },
        "solvedRate": round(solved_problems / total_problems * 100) if total_problems else 0,
        "topTags": top_tags,
        "topContributors": top_contributors,
    })
