from app import Answer, Problem, Tag, User, create_app, db
from werkzeug.security import generate_password_hash


app = create_app()

with app.app_context():
    if User.query.count() == 0:
        db.session.add_all([
            User(name="Alex Kimani", email="alex.kimani@moringaschool.com", password_hash=generate_password_hash("password123"), role="student", cohort="FT-09"),
            User(name="Sarah Jane", email="sarah.jane@moringaschool.com", password_hash=generate_password_hash("password123"), role="admin", cohort="Technical Mentor"),
            User(name="Clara Mwangi", email="clara.mwangi@moringaschool.com", password_hash=generate_password_hash("password123"), role="student", cohort="FT-08"),
        ])
        db.session.flush()

    tag_names = ["reactjs", "javascript", "python", "flask", "docker", "auth", "backend"]
    tags = []
    for name in tag_names:
        tag = Tag.query.filter_by(name=name).first()
        if not tag:
            tag = Tag(name=name)
            db.session.add(tag)
        tags.append(tag)
    db.session.flush()

    if Problem.query.count() == 0:
        students = User.query.filter_by(role="student").all()
        mentor = User.query.filter_by(role="admin").first()
        first_problem = Problem(
            title="React useEffect rendering multiple times on state update",
            body="My API fetch inside useEffect is triggered repeatedly whenever state changes. How should I structure the dependency array?",
            user_id=students[0].id,
            votes=12,
            views=104,
            tags=[tags[0], tags[1]],
        )
        second_problem = Problem(
            title="How to properly run migrations in Flask using Docker",
            body="My Flask project connects to Postgres in Docker, but the migration command cannot reach the database service.",
            user_id=students[1].id,
            votes=8,
            views=42,
            tags=[tags[2], tags[3], tags[4]],
        )
        db.session.add_all([first_problem, second_problem])
        db.session.flush()
        answer = Answer(
            problem_id=first_problem.id,
            user_id=mentor.id,
            body="Use a stable dependency list and make sure you are not creating a new object inside the dependency array on every render.",
            votes=8,
        )
        db.session.add(answer)
        db.session.flush()
        first_problem.solved_answer_id = answer.id

    db.session.commit()
    print("Seed complete. Demo login: alex.kimani@moringaschool.com / password123")
