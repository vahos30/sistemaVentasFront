const BASE_URL =
  "https://sistemainventarioapi20251005143405-fbcybrh3f2f8caeu.centralus-01.azurewebsites.net/api/Factus";
//const BASE_URL = "https://localhost:7062/api/Factus";

export async function crearFacturaFactus(datosFactura) {
  const response = await fetch(`${BASE_URL}/crear-factura-factus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosFactura),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear la factura");
  }

  return await response.json();
}

export async function crearFacturaLegal(datosFactura) {
  const response = await fetch(`${BASE_URL}/crear-factura-factus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosFactura),
  });

  if (!response.ok) {
    let errorMsg = "Error al crear la factura legal";
    try {
      const error = await response.json();
      errorMsg = error.message || JSON.stringify(error);
    } catch {}
    throw new Error(errorMsg);
  }

  return await response.json();
}

export async function descargarFacturaPDF(numeroFactura) {
  const response = await fetch(
    `${BASE_URL}/descargar-factura-pdf/${numeroFactura}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) {
    throw new Error("No se pudo descargar el PDF");
  }
  const blob = await response.blob();
  return blob;
}
