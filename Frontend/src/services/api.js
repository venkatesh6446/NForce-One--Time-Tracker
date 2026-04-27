import axios from "axios";

// 🔥 BASE URL
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Attach JWT Token (NO CHANGE)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ FIXED GLOBAL ERROR HANDLER (ONLY CHANGE HERE)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 ONLY handle 401 (not 403)
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized - token invalid or expired");

      // clear only if truly invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    // ❗ DO NOT logout on 403 or 400
    return Promise.reject(error);
  }
);

// ================= AUTH =================

// ✅ LOGIN
export const loginUser = async ({ email, password }) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

// ✅ REGISTER
export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

// ✅ RESET PASSWORD
export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

// ================= TIME ENTRIES =================

// ✅ FETCH
export const fetchTimeEntries = async () => {
  const response = await api.get("/time-entries");
  return response.data;
};

// ✅ CREATE (NO CHANGE except safe formatting)
export const createTimeEntry = async (data) => {
  const payload = {
    project: data.project,
    task: data.task,
    description: data.description,
    hours: Number(data.hours),
    date: data.date || new Date().toISOString(),
  };

  const response = await api.post("/time-entries", payload);
  return response.data;
};

export const updateTimeEntry = async (id, data) => {
  const response = await api.put(`/time-entries/${id}`, data);
  return response.data;
};

export const deleteTimeEntry = async (id) => {
  const response = await api.delete(`/time-entries/${id}`);
  return response.data;
};

// ================= FLOW ACTIONS =================

export const submitTimeEntry = async (id) => {
  const response = await api.put(`/time-entries/${id}/submit`);
  return response.data;
};

export const approveTimeEntry = async (id) => {
  const response = await api.put(`/time-entries/${id}/approve`);
  return response.data;
};

export const rejectTimeEntry = async (id) => {
  const response = await api.put(`/time-entries/${id}/reject`);
  return response.data;
};

// ================= MANAGERS =================

export const getManagers = async () => {
  const response = await api.get("/auth/managers");
  return response.data;
};


export default api;