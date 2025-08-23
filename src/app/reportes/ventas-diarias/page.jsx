"use client";

import React, { useEffect, useState } from "react";
import { obtenerVentasDiarias } from "@/app/services/reportesService";
import { obtenerFacturasAnuladas } from "@/app/services/facturasService";
import { obtenerClientes } from "@/app/services/clienteServices";
import BotonVolver from "@/app/components/BotonVolver";
import BotonDescargarPDF from "@/app/components/BotonDescargarPDF";
import { toast } from "react-toastify";

function esHoyEnColombia(fechaUTC) {
  const fechaCol = new Date(
    new Date(fechaUTC).toLocaleString("en-US", { timeZone: "America/Bogota" })
  );
  const hoyCol = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
  );
  return (
    fechaCol.getFullYear() === hoyCol.getFullYear() &&
    fechaCol.getMonth() === hoyCol.getMonth() &&
    fechaCol.getDate() === hoyCol.getDate()
  );
}

export default function VentasDiariasPage() {
  const [ventas, setVentas] = useState([]);
  const [cargandoVentas, setCargandoVentas] = useState(true);
  const [cargandoAnuladas, setCargandoAnuladas] = useState(true);
  const [facturasAnuladas, setFacturasAnuladas] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
      } catch {
        toast.error("Error al cargar los clientes");
      }
    };
    cargarClientes();
  }, []);

  useEffect(() => {
    const cargarFacturasAnuladas = async () => {
      try {
        const anuladas = await obtenerFacturasAnuladas();
        setFacturasAnuladas(anuladas);
      } catch {}
      setCargandoAnuladas(false);
    };
    cargarFacturasAnuladas();
  }, []);

  function estaAnulada(numeroFactura) {
    return facturasAnuladas.some((f) => f.numeroFactura === numeroFactura);
  }

  function obtenerNombreCliente(clienteId) {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido || ""}`.trim() : "-";
  }

  useEffect(() => {
    const cargarVentas = async () => {
      setCargandoVentas(true);
      try {
        const data = await obtenerVentasDiarias();
        const recibos = (data.recibos || [])
          .filter((r) => esHoyEnColombia(r.fecha))
          .map((r) => ({
            ...r,
            tipo: "Recibo",
            numero: r.id.slice(-8),
            clienteNombre: obtenerNombreCliente(r.clienteId),
          }));
        const facturas = (data.facturas || [])
          .filter(
            (f) => esHoyEnColombia(f.fecha) && !estaAnulada(f.numeroFactura)
          )
          .map((f) => ({
            ...f,
            tipo: "Factura",
            numero: f.numeroFactura || f.id.slice(-8),
            clienteNombre: obtenerNombreCliente(f.clienteId),
          }));
        const todasVentas = [...recibos, ...facturas].sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setVentas(todasVentas);
      } catch {
        toast.error("Error al obtener las ventas diarias");
      } finally {
        setCargandoVentas(false);
      }
    };
    if (!cargandoAnuladas && clientes.length > 0) {
      cargarVentas();
    }
  }, [cargandoAnuladas, facturasAnuladas, clientes]);

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Ventas Diarias</h2>

      {ventas.length > 0 && (
        <div className="mb-3">
          <BotonDescargarPDF
            data={ventas}
            fileName="ventas-diarias.pdf"
            title="Reporte de Ventas Diarias"
            columns={[
              {
                label: "Tipo",
                render: (v) =>
                  v.tipo === "Factura"
                    ? v.anulada
                      ? "Factura Anulada"
                      : "Factura"
                    : "Recibo",
              },
              { label: "#", key: "numero" },
              { label: "Cliente", key: "clienteNombre" },
              {
                label: "Fecha",
                render: (v) =>
                  new Date(v.fecha).toLocaleString("es-CO", {
                    timeZone: "America/Bogota",
                  }),
              },
              {
                label: "Total",
                render: (v) => `$${v.total?.toLocaleString()}`,
              },
              { label: "Forma de Pago", key: "formaPago" },
              {
                label: "Detalles",
                render: (v) =>
                  (v.detalles || [])
                    .map(
                      (d) =>
                        `Cant: ${
                          d.cantidad
                        } | Unit: $${d.precioUnitario?.toLocaleString()}${
                          d.valorDescuento > 0
                            ? ` | Desc: ${
                                d.tipoDescuento === "ValorAbsoluto"
                                  ? `$${d.valorDescuento?.toLocaleString()}`
                                  : `${d.valorDescuento}%`
                              }`
                            : ""
                        }${
                          d.valorIva > 0
                            ? ` | IVA: $${d.valorIva?.toLocaleString()}`
                            : ""
                        }`
                    )
                    .join("\n"),
              },
            ]}
          />
        </div>
      )}

      {(cargandoVentas || cargandoAnuladas) && (
        <div className="alert alert-info">Cargando ventas diarias...</div>
      )}

      {!cargandoVentas && !cargandoAnuladas && ventas.length === 0 && (
        <div className="alert alert-warning">
          No hay ventas registradas hoy.
        </div>
      )}

      {!cargandoVentas && !cargandoAnuladas && ventas.length > 0 && (
        <div className="mt-4">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Forma de Pago</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span
                        className={
                          v.tipo === "Factura"
                            ? "badge bg-primary"
                            : "badge bg-success"
                        }
                      >
                        {v.tipo}
                      </span>
                    </td>
                    <td>{v.numero}</td>
                    <td>{v.clienteNombre}</td>
                    <td>
                      {new Date(v.fecha).toLocaleString("es-CO", {
                        timeZone: "America/Bogota",
                      })}
                    </td>
                    <td>${v.total?.toLocaleString()}</td>
                    <td>{v.formaPago || "No registrado"}</td>
                    <td>
                      <ul className="mb-0">
                        {v.detalles?.map((d, idx) => (
                          <li key={idx}>
                            <strong>Cantidad:</strong> {d.cantidad}
                            {" | "}
                            <strong>Precio unitario:</strong> $
                            {d.precioUnitario?.toLocaleString()}
                            {" | "}
                            {d.valorDescuento > 0 && (
                              <>
                                <strong>Descuento:</strong>{" "}
                                {d.tipoDescuento === "ValorAbsoluto"
                                  ? `$${d.valorDescuento?.toLocaleString()}`
                                  : `${d.valorDescuento}%`}
                                {" | "}
                              </>
                            )}
                            {d.valorIva > 0 && (
                              <>
                                <strong>IVA:</strong> $
                                {d.valorIva?.toLocaleString()}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-end mt-4">
        <BotonVolver
          texto="← Volver al Módulo de Reportes"
          to="/reportes"
          className="btn-sm"
        />
      </div>
    </div>
  );
}
