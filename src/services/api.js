import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7062", // Base URL (sin /api/Clientes)
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error(
        "Error del servidor:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Error de red:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
