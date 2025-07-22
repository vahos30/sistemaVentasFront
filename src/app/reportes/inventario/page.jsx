"use client";

import React, { useEffect, useState } from "react";
import { obtenerInventario } from "@/app/services/reportesService";
import { toast } from "react-toastify";
import BotonVolver from "@/app/components/BotonVolver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReporteInventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerInventario();
        setProductos(data); // <-- Mostrar todos los productos
      } catch {
        toast.error("Error al cargar el inventario");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const handleDescargarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte de Inventario", 14, 20);

    // Prepara los datos para la tabla
    const rows = productos.map((p) => [
      p.nombre,
      p.referencia || "-",
      `$${p.precio}`,
      p.cantidadStock,
      p.activo ? "Disponible" : "No disponible",
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Producto", "Referencia", "Precio", "Stock", "Estado"]],
      body: rows,
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 50 }, // Producto
        1: { cellWidth: 35 }, // Referencia
        2: { cellWidth: 25 }, // Precio
        3: { cellWidth: 20 }, // Stock
        4: { cellWidth: 30 }, // Estado
      },
      // Si quieres que el ancho se ajuste automáticamente, puedes omitir columnStyles
      // y solo usar styles: { fontSize: 10 }
      // autoTable ajusta el texto y hace salto de línea si es necesario
    });

    doc.save("inventario.pdf");
  };

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
                            className={`badge ${
                              p.cantidadStock === 0
                                ? "bg-danger"
                                : p.cantidadStock <= 5
                                ? "bg-warning text-dark"
                                : "bg-success"
                            }`}
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
            <button
              className="btn btn-outline-success me-3"
              onClick={handleDescargarPDF}
              disabled={productos.length === 0}
            >
              <i className="bi bi-file-earmark-pdf me-2"></i>
              Descargar Inventario en PDF
            </button>
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
