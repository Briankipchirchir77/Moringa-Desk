"""Seeds the database with the same demo data the old MSW mock used, so
local dev / demos behave identically. Safe to re-run: wipes and reseeds.

Usage: python seed.py
"""
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

load_dotenv()

from app import create_app  # noqa: E402  (must follow load_dotenv)
from app.extensions import db
from app.models import User, Tag, Problem, Answer, Faq, Notification


def hours_ago(h):
    return datetime.now(timezone.utc) - timedelta(hours=h)


def mins_ago(m):
    return datetime.now(timezone.utc) - timedelta(minutes=m)


def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        users_data = [
            ("Alex Kimani", "alex.kimani@moringaschool.com", "student", "FT-09"),
            ("Brandon Wanja", "brandon.wanja@moringaschool.com", "student", "FT-09"),
            ("Clara Mwangi", "clara.mwangi@moringaschool.com", "student", "FT-08"),
            ("Ian Kipkoech", "ian.kipkoech@moringaschool.com", "student", "FT-09"),
            ("Sarah Jane", "sarah.jane@moringaschool.com", "admin", "Technical Mentor"),
            ("John", "john2@gmail.com", "admin", "Technical Mentor"),
            ("Brian Kipchirchir", "briankipchirchir964@gmail.com", "admin", "Technical Mentor"),
        ]
        users = []
        for name, email, role, cohort in users_data:
            u = User(name=name, email=email, role=role, cohort=cohort)
            u.set_password("password123")
            users.append(u)
        db.session.add_all(users)
        db.session.flush()
        alex, brandon, clara, ian, sarah, john, brian = users

        tag_names = [
            "reactjs", "javascript", "python", "flask", "django", "css", "docker",
            "postgres", "html", "mongodb", "nodejs", "hooks", "auth", "backend",
            "frontend", "sqlalchemy",
        ]
        tags = [Tag(name=n) for n in tag_names]
        db.session.add_all(tags)
        db.session.flush()
        tags_by_name = {t.name: t for t in tags}

        p1 = Problem(
            title="React useEffect rendering multiple times on state update",
            body=(
                "I am building a search input filter, but my API fetch inside useEffect is "
                "triggered infinitely. Every time setResults updates state, the hook re-renders.\n\n"
                "useEffect(() => {\n  fetchData();\n}, [query]); // infinite loop"
            ),
            user_id=brandon.id,
            votes=12,
            views=104,
            created_at=mins_ago(10),
            flagged=False,
        )
        p1.tags = [tags_by_name["reactjs"], tags_by_name["frontend"], tags_by_name["hooks"]]
        p1.followers = [alex]

        p2 = Problem(
            title="How to properly run migrations in Flask using Docker",
            body=(
                "I have a Flask project set up inside a dockerized environment but running "
                "`flask db upgrade` fails with a connection refused error against Postgres."
            ),
            user_id=clara.id,
            votes=8,
            views=42,
            created_at=hours_ago(1),
            flagged=False,
        )
        p2.tags = [tags_by_name["python"], tags_by_name["flask"], tags_by_name["docker"]]

        p3 = Problem(
            title="Authentication token missing headers in node/express requests",
            body=(
                "My frontend sends the Authorization header on every request, but "
                "req.headers.authorization is undefined on the Express side. CORS is enabled "
                "with credentials: true."
            ),
            user_id=ian.id,
            votes=5,
            views=18,
            created_at=hours_ago(2),
            flagged=False,
        )
        p3.tags = [tags_by_name["nodejs"], tags_by_name["auth"], tags_by_name["backend"]]
        p3.followers = [alex]

        db.session.add_all([p1, p2, p3])
        db.session.flush()

        a1 = Answer(
            problem_id=p1.id,
            user_id=sarah.id,
            body=(
                "The problem is you are probably generating a new `query` object on every "
                "single render. Wrap the query creation in a `useMemo` hook, or verify that "
                "you are not mutating it."
            ),
            votes=8,
            created_at=hours_ago(2),
        )
        a2 = Answer(
            problem_id=p1.id,
            user_id=clara.id,
            body="Also worth double-checking your dependency array only lists primitives, not objects/arrays created inline.",
            votes=2,
            created_at=hours_ago(1),
        )
        a3 = Answer(
            problem_id=p2.id,
            user_id=ian.id,
            body=(
                "Check that your DATABASE_URL uses the docker-compose service name (e.g. `db`) "
                "as the host, not `localhost` — that trips up almost everyone the first time."
            ),
            votes=3,
            created_at=mins_ago(30),
        )
        db.session.add_all([a1, a2, a3])
        db.session.flush()

        p1.solved_answer_id = a1.id

        faqs = [
            Faq(
                category="Enrollment",
                question="How do I submit my IP projects?",
                answer=(
                    "Submit your Independent Projects via GitHub Classroom links provided in "
                    "Canvas. Make sure to commit and push changes before the 11:59 PM Sunday deadline."
                ),
            ),
            Faq(
                category="Grading",
                question="What is the passing grade for Moringa School cohorts?",
                answer="A passing grade is 70% or higher on both the project rubric and the technical assessment.",
            ),
            Faq(
                category="Tech Stack",
                question="I have Docker issues on my Apple M-series chip.",
                answer=(
                    "Use the `--platform linux/amd64` flag on images without an arm64 build, "
                    "or switch the base image to one with multi-arch support."
                ),
            ),
            Faq(
                category="Enrollment",
                question="How do I request a 1-on-1 session with a TM?",
                answer="Book a slot through the Technical Mentor calendar link shared in your cohort Slack channel.",
            ),
            Faq(
                category="Grading",
                question="Can I self-pace or retake a module?",
                answer="Yes — reach out to your program manager to discuss a self-paced track or a module retake.",
            ),
            Faq(
                category="Enrollment",
                question="Where can I find my final transcript?",
                answer="Transcripts are issued through the Moringa School registrar portal after program completion.",
            ),
        ]
        db.session.add_all(faqs)

        notifications = [
            Notification(
                user_id=alex.id,
                type="answer",
                message="Brandon W. answered your question 'React useEffect rendering multiple times on state update'. Check it out!",
                read=False,
                created_at=mins_ago(2),
            ),
            Notification(
                user_id=alex.id,
                type="vote",
                message="5 students upvoted your explanation about dockerizing standard Flask database migrations.",
                read=False,
                created_at=hours_ago(1),
            ),
            Notification(
                user_id=alex.id,
                type="system",
                message="Reminder: IP-04 Angular Dashboard project is due this Sunday at 11:59 PM. Submit your repo early.",
                read=True,
                created_at=hours_ago(24),
            ),
            Notification(
                user_id=alex.id,
                type="accepted",
                message="Alex Kimani accepted your suggested fix for 'Flask SQLAlchemy session binding issues'.",
                read=True,
                created_at=hours_ago(48),
            ),
            Notification(
                user_id=alex.id,
                type="badge",
                message="You have resolved 10 peer programming challenges this month. Your reputation score increased +50.",
                read=True,
                created_at=hours_ago(72),
            ),
        ]
        db.session.add_all(notifications)

        db.session.commit()
        print(f"Seeded {len(users)} users, {len(tags)} tags, 3 problems, 3 answers, "
              f"{len(faqs)} FAQs, {len(notifications)} notifications.")


if __name__ == "__main__":
    seed()
