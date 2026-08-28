"""Admin reporting / metrics.

Satisfies the admin user story: 'generate reports or metrics on most
frequent problem categories and top contributors'. Admin-only.
"""
from flask import Blueprint, jsonify
from sqlalchemy import func

from ..extensions import db
from ..models import Problem, Answer, User, Faq, Notification
from ..utils import admin_required

reports_bp = Blueprint("reports", __name__, url_prefix="/reports")


@reports_bp.get("/summary")
@admin_required
def summary():
    # counts by problem category
    category_rows = (
        db.session.query(Problem.category, func.count(Problem.id))
        .group_by(Problem.category)
        .order_by(func.count(Problem.id).desc())
        .all()
    )
    top_categories = [{"category": c or "Uncategorised", "count": n} for c, n in category_rows]

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

    return jsonify({
        "totals": {
            "users": User.query.count(),
            "problems": Problem.query.count(),
            "answers": Answer.query.count(),
            "faqs": Faq.query.count(),
            "flaggedProblems": Problem.query.filter_by(flagged=True).count(),
            "flaggedAnswers": Answer.query.filter_by(flagged=True).count(),
        },
        "topCategories": top_categories,
        "topContributors": top_contributors,
    }), 200
