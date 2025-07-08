const BASE_URL = "https://localhost:7062/api/Recibos";

// Obtener todos los recibos
export async function obtenerRecibos() {
  const respuesta = await fetch(BASE_URL, { cache: "no-store" });
  if (!respuesta.ok) {
    throw new Error("Error al obtener los recibos");
  }
  return await respuesta.json();
}

export async function crearRecibo(recibo) {
  const respuesta = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recibo),
  });
  if (!respuesta.ok) {
    throw new Error("Error al crear el recibo");
  }
  return await respuesta.json();
}

export async function eliminarRecibo(id) {
  const respuesta = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!respuesta.ok) {
    throw new Error("Error al eliminar el recibo");
  }
  return true;
}
