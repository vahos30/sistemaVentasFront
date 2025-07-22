const BASE_URL =
  "https://sistemainventarioapi20250719110533-dsb7hkfuf3bvhwf7.centralus-01.azurewebsites.net/api/Reportes";

//const BASE_URL = "https://localhost:7062/api/Reportes";

export async function obtenerInventario() {
  const res = await fetch(`${BASE_URL}/inventario`);
  if (!res.ok) throw new Error("Error al obtener el inventario");
  return await res.json();
}
