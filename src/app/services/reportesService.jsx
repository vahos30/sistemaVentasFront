const BASE_URL =
  "https://sistemainventarioapi20250719110533-dsb7hkfuf3bvhwf7.centralus-01.azurewebsites.net/api/Reportes";

//const BASE_URL = "https://localhost:7062/api/Reportes";

export async function obtenerInventario() {
  const res = await fetch(`${BASE_URL}/inventario`);
  if (!res.ok) throw new Error("Error al obtener el inventario");
  return await res.json();
}

import { obtenerClientes } from "./clienteServices"; // Asegúrate de importar esto

export async function obtenerVentasPorCliente(busqueda) {
  const clientes = await obtenerClientes();
  const cliente = clientes.find(
    (c) =>
      c.numeroDocumento === busqueda.trim() ||
      (c.nombre &&
        c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
  );
  if (!cliente) throw new Error("No se encontró el cliente");

  const res = await fetch(`${BASE_URL}/cliente/${cliente.id}`);
  if (!res.ok) throw new Error("No se encontró el cliente");
  const ventas = await res.json();

  return { cliente, ventas };
}
//obtener las ventas diarias
export async function obtenerVentasDiarias() {
  const res = await fetch(`${BASE_URL}/ventas-diarias`);
  if (!res.ok) throw new Error("Error al obtener las ventas diarias");
  return await res.json();
}

//Obtener ventas por fecha
export async function obtenerVentasPorFecha(fechaInicio, fechaFin) {
  const res = await fetch(
    `${BASE_URL}/ventas?fechaInicio=${encodeURIComponent(
      fechaInicio
    )}&fechaFin=${encodeURIComponent(fechaFin)}`
  );
  if (!res.ok) throw new Error("Error al obtener las ventas por fecha");
  return await res.json();
}
