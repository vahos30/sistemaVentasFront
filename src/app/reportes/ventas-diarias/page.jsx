"use client";

import React, { useEffect, useState } from "react";
import { obtenerVentasDiarias } from "@/app/services/reportesService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";

export default function VentasDiariasPage() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarVentas = async () => {
      setCargando(true);
      try {
        const data = await obtenerVentasDiarias();
        // Combina recibos y facturas en un solo array, agregando el tipo
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
      } catch {
        toast.error("Error al obtener las ventas diarias");
      } finally {
        setCargando(false);
      }
    };
    cargarVentas();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Ventas Diarias</h2>

      {cargando && (
        <div className="alert alert-info">Cargando ventas diarias...</div>
      )}

      {!cargando && ventas.length === 0 && (
        <div className="alert alert-warning">
          No hay ventas registradas hoy.
        </div>
      )}

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
