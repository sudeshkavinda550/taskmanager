# ✅ TaskManager — Flask + React + PostgreSQL

A full-stack task management app demonstrating:
- **Flask Blueprints** for clean API architecture
- **PostgreSQL** with SQLAlchemy ORM and Flask-Migrate
- **JWT Authentication** (access + refresh tokens)
- **React** frontend with Context API and custom hooks
- **Docker Compose** for local development
- **Render.com** deployment config

---

## 📁 Folder Structure

```
taskmanager/
├── backend/                    ← Flask API
│   ├── app/
│   │   ├── __init__.py         ← App factory (create_app)
│   │   ├── config.py           ← Dev / Test / Prod configs
│   │   ├── models/
│   │   │   └── __init__.py     ← SQLAlchemy models (User, Task)
│   │   ├── auth/               ← Auth Blueprint
│   │   │   ├── __init__.py
│   │   │   └── routes.py       ← /api/auth/* routes
│   │   └── tasks/              ← Tasks Blueprint
│   │       ├── __init__.py
│   │       └── routes.py       ← /api/tasks/* routes
│   ├── migrations/             ← Flask-Migrate (auto-generated)
│   ├── wsgi.py                 ← Entry point + CLI commands
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   ← React App
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← Global auth state
│   │   ├── hooks/
│   │   │   └── useTasks.js     ← Task CRUD custom hook
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx    ← Login + Register
│   │   │   └── Dashboard.jsx   ← Main task board
│   │   ├── components/
│   │   │   └── TaskModal.jsx   ← Create/Edit task form
│   │   ├── utils/
│   │   │   └── api.js          ← Fetch wrapper for all API calls
│   │   ├── App.jsx             ← Routes + protected routes
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml          ← Local dev (all 3 services)
├── render.yaml                 ← One-click deploy to Render.com
└── README.md
```

---

## 🚀 Local Development (Recommended: Docker)

### Option 1 — Docker Compose (Easiest)
```bash
# Start PostgreSQL + Flask + React all at once
docker compose up --build

# In another terminal, create tables:
docker compose exec backend flask db init
docker compose exec backend flask db migrate -m "initial"
docker compose exec backend flask db upgrade

# Optionally seed demo data:
docker compose exec backend flask seed-db
```

Open http://localhost:3000

---

### Option 2 — Manual Setup

**Prerequisites:** Python 3.12+, Node 20+, PostgreSQL running locally

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Initialize database
flask db init
flask db migrate -m "initial migration"
flask db upgrade

# (Optional) Seed with demo data
flask seed-db

# Run dev server
flask run
# API running at http://localhost:5000
```

#### Frontend
```bash
cd frontend

# Install packages
npm install

# Configure environment
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

# Start dev server
npm start
# App running at http://localhost:3000
```

---

## 🌐 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create account | No |
| POST | `/login` | Login, get tokens | No |
| POST | `/refresh` | Get new access token | Refresh token |
| GET | `/me` | Current user profile | Yes |

### Tasks — `/api/tasks`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List tasks (filter by `?status=` `?priority=`) |
| POST | `/` | Create task |
| GET | `/<id>` | Get single task |
| PUT | `/<id>` | Update task |
| DELETE | `/<id>` | Delete task |
| GET | `/stats` | Task count statistics |

---

## ☁️ Deploy to Render.com (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render detects `render.yaml` and sets up all 3 services automatically

**Important:** After first deploy, update the URLs in `render.yaml`:
- `FRONTEND_URL` in the backend service → your Render frontend URL
- `REACT_APP_API_URL` in the frontend service → your Render backend URL

---

## 🔑 Key Concepts Demonstrated

### Flask Blueprint Pattern
```python
# Each feature is a Blueprint
auth_bp = Blueprint("auth", __name__)
tasks_bp = Blueprint("tasks", __name__)

# Registered in the app factory
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
```

### App Factory Pattern
```python
def create_app(config_name="development"):
    app = Flask(__name__)
    # Initialize extensions, register blueprints
    return app
```

### SQLAlchemy Relationships
```python
# User has many Tasks
tasks = db.relationship("Task", backref="owner", cascade="all, delete-orphan")

# Task belongs to User
user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
```

### React Pattern: Custom Hook
```js
// All task logic in one reusable hook
const { tasks, stats, createTask, updateTask, deleteTask } = useTasks(filters);
```
