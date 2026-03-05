const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
};

export const api = {
  // Auth
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, { method: "POST", headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, { method: "POST", headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),

  // Tasks
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/tasks/${qs ? `?${qs}` : ""}`, { headers: getHeaders() }).then(handleResponse);
  },

  getTask: (id) =>
    fetch(`${API_BASE}/tasks/${id}`, { headers: getHeaders() }).then(handleResponse),

  createTask: (body) =>
    fetch(`${API_BASE}/tasks/`, { method: "POST", headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  updateTask: (id, body) =>
    fetch(`${API_BASE}/tasks/${id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  deleteTask: (id) =>
    fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE", headers: getHeaders() }).then(handleResponse),

  getStats: () =>
    fetch(`${API_BASE}/tasks/stats`, { headers: getHeaders() }).then(handleResponse),
};
