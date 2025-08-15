"use client";

import React, { useEffect, useState } from "react";
import { obtenerProveedores } from "@/app/services/proveedorService";
import { obtenerProductos } from "@/app/services/productosService";
import { crearCompra } from "@/app/services/compraService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";

export default function NuevaCompraPage() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedorId, setProveedorId] = useState("");
  const [detalles, setDetalles] = useState([
    { productoId: "", cantidad: 1, precioUnitario: 0 },
  ]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const provs = await obtenerProveedores();
        setProveedores(provs);
        const prods = await obtenerProductos();
        setProductos(prods);
      } catch (error) {
        toast.error("Error cargando proveedores o productos");
      }
    };
    cargarDatos();
  }, []);

  const handleDetalleChange = (idx, field, value) => {
    const nuevosDetalles = detalles.map((d, i) =>
      i === idx ? { ...d, [field]: value } : d
    );
    setDetalles(nuevosDetalles);
  };

  const agregarDetalle = () => {
    setDetalles([
      ...detalles,
      { productoId: "", cantidad: 1, precioUnitario: 0 },
    ]);
  };

  const eliminarDetalle = (idx) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proveedorId) {
      toast.error("Seleccione un proveedor");
      return;
    }
    if (
      detalles.some(
        (d) => !d.productoId || d.cantidad <= 0 || d.precioUnitario <= 0
      )
    ) {
      toast.error("Complete correctamente todos los detalles de la compra");
      return;
    }
    setEnviando(true);
    try {
      await crearCompra({
        proveedorId,
        detalles: detalles.map((d) => ({
          productoId: d.productoId,
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
        })),
      });
      toast.success("Compra registrada exitosamente");
      setProveedorId("");
      setDetalles([{ productoId: "", cantidad: 1, precioUnitario: 0 }]);
    } catch (error) {
      toast.error("Error al registrar la compra");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Registrar Nueva Compra</h2>
        <BotonVolver texto="← Volver a Compras" to="/compras" />
      </div>
      <div className="card shadow mx-auto" style={{ maxWidth: "800px" }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Proveedor *</label>
              <select
                className="form-select"
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                required
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <hr />
            <h5>Detalles de la compra</h5>
            {detalles.map((detalle, idx) => (
              <div className="row align-items-end mb-3" key={idx}>
                <div className="col-md-5">
                  <label className="form-label">Producto *</label>
                  <select
                    className="form-select"
                    value={detalle.productoId}
                    onChange={(e) =>
                      handleDetalleChange(idx, "productoId", e.target.value)
                    }
                    required
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Cantidad *</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={detalle.cantidad}
                    onChange={(e) =>
                      handleDetalleChange(idx, "cantidad", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Precio Unitario *</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={detalle.precioUnitario}
                    onChange={(e) =>
                      handleDetalleChange(idx, "precioUnitario", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-md-2 d-flex">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => eliminarDetalle(idx)}
                    disabled={detalles.length === 1}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={agregarDetalle}
              >
                + Agregar Producto
              </button>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={enviando}
              >
                {enviando ? "Guardando..." : "Registrar Compra"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
