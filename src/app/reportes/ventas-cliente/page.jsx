"use client";

import React, { useState } from "react";
import BotonBuscar from "@/app/components/BotonBuscar";
import BotonVolver from "@/app/components/BotonVolver";
import BotonDescargarPDF from "@/app/components/BotonDescargarPDF";
import { toast } from "react-toastify";
import { obtenerVentasPorCliente } from "@/app/services/reportesService";

export default function VentasPorClientePage() {
  const [busqueda, setBusqueda] = useState("");
  const [ventas, setVentas] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      toast.error("Por favor ingrese el nombre o documento del cliente.");
      return;
    }
    setCargando(true);
    setVentas([]);
    setCliente(null);
    try {
      const data = await obtenerVentasPorCliente(busqueda.trim());
      if (data && data.cliente) {
        setCliente(data.cliente);

        // Combina recibos y facturas en un solo array, agregando el tipo
        const recibos = (data.ventas?.recibos || []).map((r) => ({
          ...r,
          tipo: "Recibo",
          numero: r.id.slice(-8), // Usa los últimos 8 caracteres del id como número
        }));
        const facturas = (data.ventas?.facturas || []).map((f) => ({
          ...f,
          tipo: "Factura",
          numero: f.numeroFactura || f.id.slice(-8),
          anulada: f.anulada,
        }));

        // Junta y ordena por fecha descendente
        const todasVentas = [...recibos, ...facturas].sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );
        setVentas(todasVentas);

        toast.success("Cliente encontrado satisfactoriamente");
      } else {
        toast.error(
          "El número de documento no se encuentra registrado en el sistema"
        );
      }
    } catch {
      toast.error(
        "El número de documento no se encuentra registrado en el sistema"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Consultar ventas por cliente</h2>
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Ingrese el nombre o número de documento del cliente:
        </label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre o número de documento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={cargando}
          />
          <BotonBuscar
            onClick={handleBuscar}
            texto={cargando ? "Buscando..." : "Buscar"}
            className="ms-2"
          />
        </div>
      </div>

      {cliente && (
        <div className="alert alert-success mt-3">
          <strong>Cliente:</strong> {cliente.nombre} {cliente.apellido} <br />
          <strong>Documento:</strong> {cliente.numeroDocumento}
        </div>
      )}

      {ventas.length > 0 && (
        <div className="mt-4">
          <h5>Ventas encontradas:</h5>
          <BotonDescargarPDF
            data={ventas}
            fileName={`ventas-${cliente?.nombre || "cliente"}.pdf`}
            title={`Ventas de ${cliente?.nombre || ""} ${
              cliente?.apellido || ""
            }`}
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
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>#</th>
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
                      {v.tipo === "Factura" ? (
                        v.anulada ? (
                          <span className="badge bg-danger">
                            Factura Anulada
                          </span>
                        ) : (
                          <span className="badge bg-primary">Factura</span>
                        )
                      ) : (
                        <span className="badge bg-success">Recibo</span>
                      )}
                    </td>
                    <td>{v.numero}</td>
                    <td>{new Date(v.fecha).toLocaleString()}</td>
                    <td>${v.total?.toLocaleString()}</td>
                    <td>{v.formaPago || "No registrado"}</td>
                    <td>
                      <ul className="mb-0">
                        {v.detalles?.map((d, idx) => (
                          <li key={idx}>
                            {/* Cantidad */}
                            <strong>Cantidad:</strong> {d.cantidad}
                            {" | "}
                            {/* Precio unitario */}
                            <strong>Precio unitario:</strong> $
                            {d.precioUnitario?.toLocaleString()}
                            {" | "}
                            {/* Descuento si existe */}
                            {d.valorDescuento > 0 && (
                              <>
                                <strong>Descuento:</strong>{" "}
                                {d.tipoDescuento === "ValorAbsoluto"
                                  ? `$${d.valorDescuento?.toLocaleString()}`
                                  : `${d.valorDescuento}%`}
                                {" | "}
                              </>
                            )}
                            {/* IVA si existe y es mayor a 0 */}
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

      {cliente && ventas.length === 0 && (
        <div className="alert alert-warning mt-3">
          El cliente no tiene ventas registradas.
        </div>
      )}

      {/* Botón Volver al final */}
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
