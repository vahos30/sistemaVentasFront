const BASE_URL = "https://localhost:7062/api/Reportes";

export async function obtenerInventario() {
  const res = await fetch(`${BASE_URL}/inventario`);
  if (!res.ok) throw new Error("Error al obtener el inventario");
  return await res.json();
}
