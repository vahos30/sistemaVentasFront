"use client";

import { useState } from "react";
import BotonGuardar from "@/app/components/BotonGuardar";
import BotonVolver from "@/app/components/BotonVolver";
import { CrearClienteNuevo } from "@/app/services/clienteServices";
import { toast } from "react-toastify";

export default function CrearClientePage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    NumeroDocumento: "",
    telefono: "",
    direccion: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const regex = {
    nombre: /^[a-zA-ZÀ-ÿ\s]+$/,
    apellido: /^[a-zA-ZÀ-ÿ\s]+$/,
    NumeroDocumento: /^[a-zA-Z0-9]+$/,
    telefono: /^[0-9+\s()-]+$/,
    direccion: /^[a-zA-Z0-9\s.,#\-\/]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  const mensajes = {
    nombre: "Solo se permiten letras y espacios.",
    apellido: "Solo se permiten letras y espacios.",
    NumeroDocumento: "Solo se permiten letras y números.",
    telefono: "Solo se permite números y caracteres válidos como +, (), -.",
    direccion: "Solo letras, números y caracteres como , . - /",
    email: "Formato de correo inválido.",
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    let primerCampoConError = null;

    for (const campo in formData) {
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
      await CrearClienteNuevo(formData);
      toast.success("Cliente creado exitosamente");

      setFormData({
        nombre: "",
        apellido: "",
        NumeroDocumento: "",
        telefono: "",
        direccion: "",
        email: "",
      });
      setErrors({});
    } catch (error) {
      toast.error(
        "❌ Error al crear el cliente. Por favor, intente nuevamente."
      );
      console.error("Error al crear cliente:", error);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">Registrar Cliente</h2>

          <form onSubmit={(e) => e.preventDefault()}>
            {/** Nombre */}
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

            {/** Apellido */}
            <div className="mb-3">
              <label className="form-label">Apellido:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.apellido ? "is-invalid" : ""
                }`}
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
              {errors.apellido && (
                <div className="invalid-feedback">{errors.apellido}</div>
              )}
            </div>

            {/** Número de Documento */}
            <div className="mb-3">
              <label className="form-label">Número de Documento:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.NumeroDocumento ? "is-invalid" : ""
                }`}
                name="NumeroDocumento"
                value={formData.NumeroDocumento}
                onChange={handleChange}
              />
              {errors.NumeroDocumento && (
                <div className="invalid-feedback">{errors.NumeroDocumento}</div>
              )}
            </div>

            {/** Teléfono */}
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

            {/** Dirección */}
            <div className="mb-3">
              <label className="form-label">Dirección:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.direccion ? "is-invalid" : ""
                }`}
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
              {errors.direccion && (
                <div className="invalid-feedback">{errors.direccion}</div>
              )}
            </div>

            {/** Email */}
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

            <div className="d-flex justify-content-center">
              <BotonGuardar onClick={handleGuardar} texto="Guardar Cliente" />
            </div>

            <div className="text-center mt-4">
              <BotonVolver texto="← Volver" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
