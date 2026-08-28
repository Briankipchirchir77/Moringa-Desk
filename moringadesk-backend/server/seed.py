"""Seed the database from server/seed_data.json (the old json-server data).

Run it with:  python -m server.seed

The old json-server ids are a mix of numbers ("1") and random strings
("lNbqnODJ2tQ"), so instead of forcing them onto our integer primary keys we
let the database assign fresh ids and keep a map from each old id to the new
row. Foreign keys (userId, problemId, tagIds, followerIds, solvedAnswerId)
are then resolved through those maps.
"""
import json
import os
from datetime import datetime, timezone

from . import create_app
from .extensions import db
from .models import User, Tag, Problem, Answer, Faq, Notification

DATA_FILE = os.path.join(os.path.dirname(__file__), "seed_data.json")


def _key(v):
    """Normalise any id (number or string) to a string map key."""
    return str(v) if v is not None else None


def _dt(value):
    if not value:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def seed():
    with open(DATA_FILE) as f:
        data = json.load(f)

    db.drop_all()
    db.create_all()

    tag_map, user_map, problem_map, answer_map = {}, {}, {}, {}

    # tags
    for t in data.get("tags", []):
        tag = Tag(name=t["name"])
        db.session.add(tag)
        tag_map[_key(t["id"])] = tag

    # users (hash the demo passwords)
    for u in data.get("users", []):
        user = User(
            name=u["name"], email=u["email"].lower(),
            role=u.get("role", "student"), cohort=u.get("cohort"),
        )
        user.set_password(u.get("password", "password123"))
        db.session.add(user)
        user_map[_key(u["id"])] = user
    db.session.flush()

    # problems (+ tag / follower links) — solvedAnswerId resolved later
    solved_pending = []
    for p in data.get("problems", []):
        author = user_map.get(_key(p["userId"]))
        if not author:
            continue
        problem = Problem(
            title=p["title"], body=p["body"], user_id=author.id,
            votes=p.get("votes", 0), views=p.get("views", 0),
            category=p.get("category"), cohort_stage=p.get("cohortStage"),
            flagged=p.get("flagged", False), created_at=_dt(p.get("createdAt")),
        )
        problem.tags = [tag_map[_key(t)] for t in p.get("tagIds", []) if _key(t) in tag_map]
        problem.followers = [user_map[_key(u)] for u in p.get("followerIds", []) if _key(u) in user_map]
        db.session.add(problem)
        problem_map[_key(p["id"])] = problem
        if p.get("solvedAnswerId") is not None:
            solved_pending.append((problem, _key(p["solvedAnswerId"])))
    db.session.flush()

    # answers
    for a in data.get("answers", []):
        problem = problem_map.get(_key(a["problemId"]))
        author = user_map.get(_key(a["userId"]))
        if not problem or not author:
            continue
        answer = Answer(
            problem_id=problem.id, user_id=author.id, body=a["body"],
            votes=a.get("votes", 0), flagged=a.get("flagged", False),
            created_at=_dt(a.get("createdAt")),
        )
        db.session.add(answer)
        answer_map[_key(a["id"])] = answer
    db.session.flush()

    # now that answers have real ids, resolve each problem's accepted answer
    for problem, old_answer_id in solved_pending:
        answer = answer_map.get(old_answer_id)
        if answer:
            problem.solved_answer_id = answer.id

    # faqs
    for fq in data.get("faqs", []):
        db.session.add(Faq(question=fq["question"], answer=fq["answer"], category=fq.get("category")))

    # notifications
    for n in data.get("notifications", []):
        user = user_map.get(_key(n["userId"]))
        if not user:
            continue
        db.session.add(Notification(
            user_id=user.id, type=n.get("type", "info"), message=n["message"],
            read=n.get("read", False), created_at=_dt(n.get("createdAt")),
        ))

    db.session.commit()
    print("Seeded: "
          f"{len(user_map)} users, {len(tag_map)} tags, "
          f"{len(problem_map)} problems, {len(answer_map)} answers, "
          f"{len(data.get('faqs', []))} faqs, {len(data.get('notifications', []))} notifications.")
    print("All demo users share the password: password123")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed()
