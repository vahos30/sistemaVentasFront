"use client";

import { useState } from "react";
import BotonGuardar from "@/app/components/BotonGuardar";
import BotonVolver from "@/app/components/BotonVolver";
import { crearProveedor } from "@/app/services/proveedorService";
import { toast } from "react-toastify";

export default function CrearProveedorPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    razonSocial: "",
    nit: "",
    telefono: "",
    email: "",
    activo: true,
  });

  const [errors, setErrors] = useState({});

  const regex = {
    nombre: /^[a-zA-ZÀ-ÿ0-9\s]+$/,
    razonSocial: /^[a-zA-ZÀ-ÿ0-9\s]+$/,
    nit: /^[a-zA-Z0-9\-]+$/,
    telefono: /^[0-9+\s()-]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  const mensajes = {
    nombre: "Solo se permiten letras, números y espacios.",
    razonSocial: "Solo se permiten letras, números y espacios.",
    nit: "Solo se permiten letras, números y guiones.",
    telefono: "Solo se permite números y caracteres válidos como +, (), -.",
    email: "Formato de correo inválido.",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    let primerCampoConError = null;

    for (const campo in formData) {
      if (campo === "activo") continue; // No validar checkbox
      const valor = formData[campo].trim();

      if (!valor) {
        nuevosErrores[campo] = "Este campo es obligatorio";
        if (!primerCampoConError) primerCampoConError = campo;
      } else if (!regex[campo].test(valor)) {
        nuevosErrores[campo] = mensajes[campo];
        if (!primerCampoConError) primerCampoConError = campo;
      }
    }

    setErrors(nuevosErrores);

    if (primerCampoConError) {
      const input = document.querySelector(
        `input[name="${primerCampoConError}"]`
      );
      if (input) input.focus();
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarCampos()) return;

    try {
      await crearProveedor(formData);
      toast.success("✅ Proveedor creado exitosamente");

      // Limpiar formulario
      setFormData({
        nombre: "",
        razonSocial: "",
        nit: "",
        telefono: "",
        email: "",
        activo: true,
      });
      setErrors({});
    } catch (error) {
      toast.error(`❌ ${error.message || "Error al guardar el proveedor"}`);
      console.error("Error:", error);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">Registrar Proveedor</h2>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label">Nombre:</label>
              <input
                type="text"
                className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && (
                <div className="invalid-feedback">{errors.nombre}</div>
              )}
            </div>

            {/* Razón Social */}
            <div className="mb-3">
              <label className="form-label">Razón Social:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.razonSocial ? "is-invalid" : ""
                }`}
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
              />
              {errors.razonSocial && (
                <div className="invalid-feedback">{errors.razonSocial}</div>
              )}
            </div>

            {/* NIT */}
            <div className="mb-3">
              <label className="form-label">NIT:</label>
              <input
                type="text"
                className={`form-control ${errors.nit ? "is-invalid" : ""}`}
                name="nit"
                value={formData.nit}
                onChange={handleChange}
              />
              {errors.nit && (
                <div className="invalid-feedback">{errors.nit}</div>
              )}
            </div>

            {/* Teléfono */}
            <div className="mb-3">
              <label className="form-label">Teléfono:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.telefono ? "is-invalid" : ""
                }`}
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
              {errors.telefono && (
                <div className="invalid-feedback">{errors.telefono}</div>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email:</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Activo */}
            <div className="mb-3">
              <label className="form-label" htmlFor="activoProveedor">
                Proveedor activo
              </label>
              <select
                className="form-select"
                name="activo"
                id="activoProveedor"
                value={formData.activo ? "si" : "no"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activo: e.target.value === "si",
                  })
                }
              >
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="d-flex justify-content-center">
              <BotonGuardar onClick={handleGuardar} texto="Guardar Proveedor" />
            </div>

            <div className="text-center mt-4">
              <BotonVolver
                texto="← Volver al Modulo de Proveedores"
                to="/proveedor"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
