from datetime import datetime
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import Task
from . import tasks_bp


@tasks_bp.route("/", methods=["GET"])
@jwt_required()
def get_tasks():
    """Get all tasks for the current user with optional filters."""
    current_user_id = get_jwt_identity()

    # Optional query params for filtering
    status = request.args.get("status")
    priority = request.args.get("priority")

    query = Task.query.filter_by(user_id=current_user_id)

    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)

    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify({"tasks": [t.to_dict() for t in tasks]}), 200


@tasks_bp.route("/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    """Get a single task by ID (only if owned by current user)."""
    current_user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first_or_404()
    return jsonify({"task": task.to_dict()}), 200


@tasks_bp.route("/", methods=["POST"])
@jwt_required()
def create_task():
    """Create a new task."""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or "title" not in data:
        return jsonify({"error": "'title' is required"}), 400

    due_date = None
    if data.get("due_date"):
        try:
            due_date = datetime.fromisoformat(data["due_date"])
        except ValueError:
            return jsonify({"error": "Invalid due_date format. Use ISO 8601."}), 400

    task = Task(
        title=data["title"],
        description=data.get("description"),
        status=data.get("status", "todo"),
        priority=data.get("priority", "medium"),
        due_date=due_date,
        user_id=current_user_id,
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"message": "Task created", "task": task.to_dict()}), 201


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    """Update an existing task."""
    current_user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first_or_404()

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Update fields if present in request
    if "title" in data:
        task.title = data["title"]
    if "description" in data:
        task.description = data["description"]
    if "status" in data:
        task.status = data["status"]
    if "priority" in data:
        task.priority = data["priority"]
    if "due_date" in data:
        if data["due_date"]:
            try:
                task.due_date = datetime.fromisoformat(data["due_date"])
            except ValueError:
                return jsonify({"error": "Invalid due_date format. Use ISO 8601."}), 400
        else:
            task.due_date = None

    task.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Task updated", "task": task.to_dict()}), 200


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    """Delete a task."""
    current_user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first_or_404()

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted"}), 200


@tasks_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    """Get task statistics for the current user."""
    current_user_id = get_jwt_identity()

    total = Task.query.filter_by(user_id=current_user_id).count()
    todo = Task.query.filter_by(user_id=current_user_id, status="todo").count()
    in_progress = Task.query.filter_by(user_id=current_user_id, status="in_progress").count()
    done = Task.query.filter_by(user_id=current_user_id, status="done").count()

    return jsonify({
        "stats": {
            "total": total,
            "todo": todo,
            "in_progress": in_progress,
            "done": done,
        }
    }), 200
