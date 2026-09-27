import axios from "axios";


// ============================================================
// API CONFIGURATION
// ============================================================

const api = axios.create({
  baseURL: "https://campus-recruitment-system-sn3d.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("crems_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {

    if (error.response?.status === 401) {

      const currentPath = window.location.pathname;

      if (currentPath !== "/login") {

        localStorage.removeItem("crems_token");
        localStorage.removeItem("crems_user");

      }
    }

    return Promise.reject(error);
  }
);


export default api;