// src/services/clienteService.jsAdd commentMore actions
const API_URL = "https://localhost:7062/api/Clientes";

//Metodo para obtener todos los clientes
export const obtenerClientes = async () => {
  try {
    console.log("Iniciando fetch a:", API_URL); // Verifica la URL
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log("Response status:", response.status); // Debe ser 200

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("Data recibida:", data); // ¿Llegan los datos?
    return data;
  } catch (error) {
    console.error("Error en fetch:", error.message); // Mensaje detallado
    throw error;
  }
};

//metodo para crear un nuevo cliente
export const CrearClienteNuevo = async (cliente) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cliente),
    });
    if (!response.ok)
      throw new Error(`Error al crear cliente: ${response.status}`);

    const data = await response.json();
    console.log("Cliente creado exitosamente", data);
    return data;
  } catch (error) {
    console.error("Error creando cliente", error.message);
    throw new Error(
      "No se pudo Crear el Cliente error al conectar con el Servidor, Intente nuevamente o Comuniquese con El administrador"
    );
  }
};
