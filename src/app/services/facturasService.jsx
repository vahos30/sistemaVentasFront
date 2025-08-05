const BASE_URL =
  "https://sistemainventarioapi20250719110533-dsb7hkfuf3bvhwf7.centralus-01.azurewebsites.net/api/Facturas";
//const BASE_URL = "https://localhost:7062/api/Facturas";

// Obtener todas las facturas
export async function obtenerFacturas() {
  const respuesta = await fetch(BASE_URL, { cache: "no-store" });
  if (!respuesta.ok) {
    throw new Error("Error al obtener las facturas");
  }
  return await respuesta.json();
}

// Crear una nueva factura
export async function crearFactura(factura) {
  const respuesta = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(factura),
  });
  if (!respuesta.ok) {
    throw new Error("Error al crear la factura");
  }
  return await respuesta.json();
}
