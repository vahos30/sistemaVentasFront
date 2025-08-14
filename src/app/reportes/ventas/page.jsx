"use client";

import React, { useState } from "react";
import { obtenerVentasPorFecha } from "@/app/services/reportesService";
import BotonBuscar from "@/app/components/BotonBuscar";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";

export default function VentasPorFechaPage() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(false);

  const handleConsultar = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Debe seleccionar ambas fechas.");
      return;
    }
    setCargando(true);
    setVentas([]);
    try {
      const data = await obtenerVentasPorFecha(fechaInicio, fechaFin);
      const recibos = (data.recibos || []).map((r) => ({
        ...r,
        tipo: "Recibo",
        numero: r.id.slice(-8),
      }));
      const facturas = (data.facturas || []).map((f) => ({
        ...f,
        tipo: "Factura",
        numero: f.numeroFactura || f.id.slice(-8),
      }));
      const todasVentas = [...recibos, ...facturas].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setVentas(todasVentas);
      if (todasVentas.length === 0) {
        toast.info("No hay ventas en el rango de fechas seleccionado.");
      }
    } catch {
      toast.error("Error al consultar las ventas por fecha.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Consultar ventas por fecha</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label fw-semibold">Fecha de inicio:</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            disabled={cargando}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Fecha final:</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            disabled={cargando}
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <BotonBuscar
            onClick={handleConsultar}
            texto={cargando ? "Consultando..." : "Consultar"}
            className="ms-2"
          />
        </div>
      </div>

      {ventas.length > 0 && (
        <div className="mt-4">
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
                    <td>{new Date(v.fecha).toLocaleString()}</td>
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
