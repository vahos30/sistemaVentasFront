const API_URL =
  "https://sistemainventarioapi20250719110533-dsb7hkfuf3bvhwf7.centralus-01.azurewebsites.net/api/Compra";
//const API_URL = "https://localhost:7062/api/Compra";

export const obtenerCompras = async () => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error al obtener compras:", error.message);
    throw error;
  }
};

export const crearCompra = async (compra) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compra),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    // Si el backend retorna el objeto creado, lo devolvemos, si no, null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error al crear compra:", error.message);
    throw error;
  }
};

export async function anularCompra(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar la compra.");
  }
}

export async function anularCompraParcial(id, detalles) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}/anular-parcial`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      compraId: id,
      detalles,
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "No se pudo anular parcialmente la compra.");
  }
}
