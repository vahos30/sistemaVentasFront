const BASE_URL =
  "sistemainventarioapi20251005143405-fbcybrh3f2f8caeu.centralus-01.azurewebsites.net/api/Productos";

//const BASE_URL = "https://localhost:7062/api/Productos";

// Obtener todos los productos
export async function obtenerProductos() {
  const respuesta = await fetch(BASE_URL, { cache: "no-store" });
  if (!respuesta.ok) {
    throw new Error("Error al obtener los productos");
  }
  return await respuesta.json();
}

// Crear un nuevo producto
export async function crearProducto(producto) {
  const respuesta = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });
  if (!respuesta.ok) {
    throw new Error("Error al crear el producto");
  }
  return await respuesta.json();
}

// Actualizar un producto existente
export async function actualizarProducto(id, producto) {
  const respuesta = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });
  if (!respuesta.ok) {
    throw new Error("Error al actualizar el producto");
  }
  // Si la respuesta no tiene contenido, no intentes parsear JSON
  if (respuesta.status === 204) return;
  const text = await respuesta.text();
  return text ? JSON.parse(text) : null;
}

// Eliminar un producto
export async function eliminarProducto(id) {
  const respuesta = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!respuesta.ok) {
    throw new Error("Error al eliminar el producto");
  }
}
