const BASE_URL = "https://localhost:7062/api/Recibos";

// Obtener todos los recibos
export async function obtenerRecibos() {
  const respuesta = await fetch(BASE_URL, { cache: "no-store" });
  if (!respuesta.ok) {
    throw new Error("Error al obtener los recibos");
  }
  return await respuesta.json();
}
