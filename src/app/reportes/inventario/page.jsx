"use client";

import React, { useEffect, useState } from "react";
import { obtenerInventario } from "@/app/services/reportesService";
import { toast } from "react-toastify";
import BotonVolver from "@/app/components/BotonVolver";

export default function ReporteInventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerInventario();
        setProductos(data.filter((p) => p.activo));
      } catch {
        toast.error("Error al cargar el inventario");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="container py-5">
      <div
        className="card shadow mx-auto reporte-card"
        style={{ maxWidth: 900 }}
      >
        <div className="card-body">
          <h2 className="text-center mb-4 text-black">Reporte de Inventario</h2>
          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="mt-2 text-muted">Cargando inventario...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-bordered align-middle shadow-sm">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Referencia</th>
                    <th>Precio</th>
                    <th>Cantidad en Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No hay productos disponibles en inventario.
                      </td>
                    </tr>
                  ) : (
                    productos.map((p, idx) => (
                      <tr key={p.id}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold">{p.nombre}</td>
                        <td>
                          {p.referencia || (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>${p.precio.toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              p.cantidadStock > 2 ? "success" : "warning"
                            } text-dark`}
                          >
                            {p.cantidadStock}
                          </span>
                        </td>
                        <td>
                          {p.activo ? (
                            <span className="badge bg-success">Disponible</span>
                          ) : (
                            <span className="badge bg-danger">
                              No disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="text-end mt-4">
            <BotonVolver
              texto="← Volver al módulo de Reportes"
              to="/reportes"
              className="btn-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
