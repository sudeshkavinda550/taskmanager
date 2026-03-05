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
  if (!res.ok) {
    // Enhanced error logging for 422 errors
    if (res.status === 422) {
      console.error('Validation Error Details:', {
        status: res.status,
        statusText: res.statusText,
        data: data,
        url: res.url
      });
    }
    throw new Error(data.error || data.message || "Something went wrong");
  }
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

  // Tasks - FIXED VERSION
  getTasks: (params = {}) => {
    // Remove trailing slash from base URL if present
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    
    // Build the URL properly
    let url = `${baseUrl}/tasks`;
    
    // Add query parameters if they exist
    if (Object.keys(params).length > 0) {
      const qs = new URLSearchParams(params).toString();
      url += `?${qs}`;
    }
    
    console.log('Fetching tasks from:', url); // Debug log
    return fetch(url, { headers: getHeaders() }).then(handleResponse);
  },

  getTask: (id) => {
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    return fetch(`${baseUrl}/tasks/${id}`, { headers: getHeaders() }).then(handleResponse);
  },

  createTask: (body) => {
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    return fetch(`${baseUrl}/tasks`, { // Removed trailing slash
      method: "POST", 
      headers: getHeaders(), 
      body: JSON.stringify(body) 
    }).then(handleResponse);
  },

  updateTask: (id, body) => {
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    return fetch(`${baseUrl}/tasks/${id}`, { 
      method: "PUT", 
      headers: getHeaders(), 
      body: JSON.stringify(body) 
    }).then(handleResponse);
  },

  deleteTask: (id) => {
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    return fetch(`${baseUrl}/tasks/${id}`, { 
      method: "DELETE", 
      headers: getHeaders() 
    }).then(handleResponse);
  },

  getStats: () => {
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    return fetch(`${baseUrl}/tasks/stats`, { headers: getHeaders() }).then(handleResponse);
  },
};

// Optional: Add a utility function to debug the API
export const debugAPI = async () => {
  const token = localStorage.getItem("access_token");
  console.log('Current token:', token ? 'Present' : 'Missing');
  console.log('API Base URL:', API_BASE);
  
  try {
    // Test tasks endpoint
    const tasks = await api.getTasks();
    console.log('Tasks fetched successfully:', tasks);
  } catch (error) {
    console.error('Debug - API Error:', {
      message: error.message,
      stack: error.stack
    });
  }
};
