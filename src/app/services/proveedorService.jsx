const API_URL =
  "https://sistemainventarioapi20251005143405-fbcybrh3f2f8caeu.centralus-01.azurewebsites.net/api/Proveedor"; // URL de la API EN AZURE

//const API_URL = "https://localhost:7062/api/Proveedor";

// Método para obtener todos los proveedores (GET)
export const obtenerProveedores = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en fetch proveedores:", error.message);
    throw error;
  }
};

export const crearProveedor = async (proveedor) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proveedor),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al crear proveedor:", error.message);
    throw error;
  }
};

export const actualizarProveedor = async (id, proveedor) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proveedor),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Solo intenta leer JSON si hay contenido
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error al actualizar proveedor:", error.message);
    throw error;
  }
};

export const obtenerProveedorPorId = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("No se encontró el proveedor");
  return await response.json();
};

export const eliminarProveedor = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar proveedor");
  return true;
};
