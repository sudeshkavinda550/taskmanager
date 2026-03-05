import os
from app import create_app, db
from app.models import User, Task
from flask_migrate import upgrade

app = create_app(os.environ.get("FLASK_ENV", "development"))


@app.shell_context_processor
def make_shell_context():
    """Make db models available in flask shell for debugging."""
    return {"db": db, "User": User, "Task": Task}


@app.cli.command("init-db")
def init_db():
    """Initialize the database and run migrations."""
    upgrade()
    print("Database initialized successfully.")


@app.cli.command("seed-db")
def seed_db():
    """Seed the database with sample data for development."""
    # Create a test user
    user = User(username="demo", email="demo@example.com")
    user.set_password("password123")
    db.session.add(user)
    db.session.flush()

    # Create sample tasks
    tasks = [
        Task(title="Set up Flask project", status="done", priority="high", user_id=user.id),
        Task(title="Connect PostgreSQL", status="done", priority="high", user_id=user.id),
        Task(title="Build React frontend", status="in_progress", priority="medium", user_id=user.id),
        Task(title="Write unit tests", status="todo", priority="low", user_id=user.id),
        Task(title="Deploy to production", status="todo", priority="high", user_id=user.id),
    ]
    db.session.add_all(tasks)
    db.session.commit()
    print("Database seeded successfully. Login: demo@example.com / password123")


if __name__ == "__main__":
    app.run()
