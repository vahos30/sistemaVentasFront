"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerProveedorPorId,
  actualizarProveedor,
} from "@/app/services/proveedorService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";

export default function EditarProveedor({ params }) {
  const { id } = React.use(params);
  const [proveedor, setProveedor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cargarProveedor = async () => {
      try {
        const data = await obtenerProveedorPorId(id);
        setProveedor(data);
        setErrores({});
      } catch (error) {
        toast.error(`Error al cargar el proveedor: ${error.message}`);
        setErrores({ general: error.message });
      } finally {
        setCargando(false);
      }
    };
    cargarProveedor();
  }, [id]);

  const handleActualizar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErrores({});
    try {
      await actualizarProveedor(id, proveedor);
      toast.success("¡Proveedor actualizado exitosamente!", {
        autoClose: 1000,
        onClose: () => router.replace("/proveedor/todos"),
      });
    } catch (error) {
      setErrores({ general: error.message });
      toast.error(`Error al actualizar: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProveedor({
      ...proveedor,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (cargando) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">Cargando datos del proveedor...</div>
      </div>
    );
  }

  if (!proveedor) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Error al cargar el proveedor</h4>
          <p>
            {errores.general ||
              "El proveedor solicitado no existe o no se pudo cargar."}
          </p>
          <BotonVolver
            texto="Volver al listado"
            to="/proveedor/todos"
            className="mt-3"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Editar Proveedor</h2>
        <BotonVolver texto="← Volver al listado" to="/proveedor/todos" />
      </div>

      {errores.general && (
        <div className="alert alert-danger mb-4">{errores.general}</div>
      )}

      <div className="card shadow mx-auto" style={{ maxWidth: "700px" }}>
        <div className="card-body">
          <form onSubmit={handleActualizar}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={proveedor.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Razón Social *</label>
                <input
                  type="text"
                  className="form-control"
                  name="razonSocial"
                  value={proveedor.razonSocial}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">NIT *</label>
                <input
                  type="text"
                  className="form-control"
                  name="nit"
                  value={proveedor.nit}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono *</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefono"
                  value={proveedor.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={proveedor.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-12 mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="activo"
                    checked={proveedor.activo}
                    onChange={handleChange}
                    id="activoProveedor"
                  />
                  <label className="form-check-label" htmlFor="activoProveedor">
                    Proveedor activo
                  </label>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={enviando}
              >
                {enviando ? "Guardando..." : "Actualizar Proveedor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
