from flask import Blueprint

tasks_bp = Blueprint("tasks", __name__)

from . import routes  # noqa: F401, E402
