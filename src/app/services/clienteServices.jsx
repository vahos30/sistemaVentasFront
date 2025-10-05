// src/services/clienteService.jsAdd commentMore actions
const API_URL =
  "sistemainventarioapi20251005143405-fbcybrh3f2f8caeu.centralus-01.azurewebsites.net/api/Clientes";

//const API_URL = "https://localhost:7062/api/Clientes";

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

// Método para obtener un cliente por número de documento
export const obtenerClientePorDocumento = async (numeroDocumento) => {
  try {
    const response = await fetch(
      `${API_URL}/por-documento/${numeroDocumento}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 404) {
      return null; // Cliente no encontrado - caso normal
    }

    if (!response.ok) {
      throw new Error(`Error al obtener cliente: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al buscar cliente por documento:", error.message);
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

// metodo para actualizar un cliente

// src/services/clienteService.js
export const actualizarCliente = async (id, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosActualizados),
    });

    if (!response.ok) {
      // Intenta obtener el mensaje de error del backend
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) errorMessage += `: ${errorData}`;
      } catch (e) {}

      throw new Error(errorMessage);
    }

    // Manejar respuestas vacías (204 No Content)
    if (response.status === 204) {
      console.log("Cliente actualizado exitosamente (sin contenido)");
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error actualizando cliente", error.message);
    throw error;
  }
};

// Método para eliminar un cliente
export const eliminarCliente = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar cliente");
    }

    return true;
  } catch (error) {
    console.error("Error eliminando cliente:", error.message);
    throw error;
  }
};
// Obtener cliente por ID
export const obtenerClientePorId = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Cliente no encontrado");
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo cliente por ID:", error.message);
    throw error;
  }
};
