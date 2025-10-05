const BASE_URL =
  "sistemainventarioapi20251005143405-fbcybrh3f2f8caeu.centralus-01.azurewebsites.net/api/Facturas";
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
//obtener las facturas anuladas
export async function obtenerFacturasAnuladas() {
  const respuesta = await fetch(`${BASE_URL}/anuladas`, { cache: "no-store" });
  if (!respuesta.ok) {
    throw new Error("Error al obtener las facturas anuladas");
  }
  return await respuesta.json();
}

// Anular una factura
export async function anularFactura(id, motivo) {
  const respuesta = await fetch(`${BASE_URL}/${id}/anular`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(motivo),
  });
  if (!respuesta.ok) {
    throw new Error("Error al anular la factura");
  }
  // Si la respuesta es 204 No Content, retorna null
  if (respuesta.status === 204) {
    return null;
  }
  // Si hay contenido, retorna el JSON
  return await respuesta.json();
}
