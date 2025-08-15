"use client";

import React, { useEffect, useState } from "react";
import { obtenerCompras } from "@/app/services/compraService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";

export default function TodasComprasPage() {
  const [compras, setCompras] = useState([]);
  const [filtradas, setFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    const cargarCompras = async () => {
      try {
        const data = await obtenerCompras();
        setCompras(data);
        setFiltradas(data);
        toast.success("Compras cargadas exitosamente", {
          autoClose: 2000,
          toastId: "compras-cargadas", // ← Agrega un toastId único
        });
      } catch (error) {
        toast.error("Error al cargar compras: " + error.message, {
          autoClose: 2000,
        });
      } finally {
        setCargando(false);
      }
    };
    cargarCompras();
  }, []);

  useEffect(() => {
    let resultado = compras;

    // Filtrar por nombre de proveedor
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(
        (compra) =>
          compra.proveedor?.nombre &&
          compra.proveedor.nombre.toLowerCase().includes(termino)
      );
    }

    // Filtrar por rango de fechas
    if (fechaInicio) {
      resultado = resultado.filter(
        (compra) => new Date(compra.fecha) >= new Date(fechaInicio)
      );
    }
    if (fechaFin) {
      resultado = resultado.filter(
        (compra) => new Date(compra.fecha) <= new Date(fechaFin)
      );
    }

    setFiltradas(resultado);
  }, [busqueda, fechaInicio, fechaFin, compras]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Compras</h2>
        <BotonVolver texto="← Volver al Módulo de Compras" to="/compras" />
      </div>

      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre de proveedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={cargando}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            disabled={cargando}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            disabled={cargando}
          />
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando compras...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow">
            <thead className="table-info">
              <tr>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length > 0 ? (
                filtradas.map((compra) => (
                  <tr key={compra.id}>
                    <td>
                      <strong>{compra.proveedor?.nombre}</strong>
                    </td>
                    <td>{new Date(compra.fecha).toLocaleString()}</td>
                    <td>${compra.total?.toLocaleString()}</td>
                    <td>
                      <ul className="mb-0">
                        {compra.detalles?.map((detalle) => (
                          <li key={detalle.id}>
                            <strong>Producto:</strong>{" "}
                            {detalle.producto?.nombre}
                            {" | "}
                            <strong>Cantidad:</strong> {detalle.cantidad}
                            {" | "}
                            <strong>Precio unitario:</strong> $
                            {detalle.precioUnitario?.toLocaleString()}
                            {" | "}
                            <strong>Subtotal:</strong> $
                            {detalle.subTotal?.toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No hay compras registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-end text-muted small mt-2">
            Mostrando {filtradas.length} compras
          </div>
        </div>
      )}
    </div>
  );
}
