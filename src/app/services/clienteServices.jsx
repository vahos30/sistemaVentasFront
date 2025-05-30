// src/services/clienteService.js
const API_URL = "https://localhost:7062/api/Clientes";

export const obtenerClientes = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los clientes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al conectar con la API:", error);
    throw error;
  }
};
