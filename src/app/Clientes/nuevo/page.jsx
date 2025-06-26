"use client";

import { useState } from "react";
import BotonGuardar from "@/app/components/BotonGuardar";
import BotonVolver from "@/app/components/BotonVolver";
import {
  CrearClienteNuevo,
  actualizarCliente,
} from "@/app/services/clienteServices";
import { obtenerClientePorDocumento } from "@/app/services/clienteServices";
import { toast } from "react-toastify";

export default function CrearClientePage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    NumeroDocumento: "",
    telefono: "",
    direccion: "",
    email: "",
  });

  const [clienteId, setClienteId] = useState(null);
  const [clienteExistente, setClienteExistente] = useState(false);
  const [errors, setErrors] = useState({});

  const regex = {
    nombre: /^[a-zA-ZÀ-ÿ\s]+$/,
    apellido: /^[a-zA-ZÀ-ÿ\s]+$/,
    tipoDocumento:
      /^(Cédula de Ciudadanía|Cédula de Extranjería|Pasaporte|Nit)$/,
    NumeroDocumento: /^[a-zA-Z0-9\-]+$/,
    telefono: /^[0-9+\s()-]+$/,
    direccion: /^[a-zA-Z0-9\s.,#\-\/]+$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  const mensajes = {
    nombre: "Solo se permiten letras y espacios.",
    apellido: "Solo se permiten letras y espacios.",
    tipoDocumento: "Debe seleccionar un tipo de documento válido.",
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
      if (clienteExistente && clienteId) {
        const datosActualizados = {
          ...formData,
          Id: clienteId,
        };

        await actualizarCliente(clienteId, datosActualizados);
        toast.success("✅ Cliente actualizado exitosamente");
      } else {
        const nuevoCliente = await CrearClienteNuevo(formData);
        toast.success("✅ Cliente creado exitosamente");
      }

      // Limpiar formulario
      setFormData({
        nombre: "",
        apellido: "",
        tipoDocumento: "",
        NumeroDocumento: "",
        telefono: "",
        direccion: "",
        email: "",
      });
      setErrors({});
      setClienteExistente(false);
      setClienteId(null);
    } catch (error) {
      toast.error(`❌ ${error.message || "Error al guardar el cliente"}`);
      console.error("Error:", error);
    }
  };

  const verificarClienteExistente = async () => {
    const numeroDocumento = formData.NumeroDocumento.trim();
    if (!numeroDocumento) return;

    try {
      const cliente = await obtenerClientePorDocumento(numeroDocumento);

      if (cliente) {
        // Cliente encontrado - cargar datos
        setFormData({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          tipoDocumento: cliente.tipoDocumento || "",
          NumeroDocumento: cliente.numeroDocumento,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          email: cliente.email,
        });

        setClienteId(cliente.id);
        setClienteExistente(true);
        toast.warn(
          "⚠️ El cliente ya está registrado. Se han cargado sus datos."
        );
      } else {
        // Cliente NO encontrado - resetear estado
        setClienteExistente(false);
        setClienteId(null);
        console.log("Cliente no encontrado - se puede crear uno nuevo");
      }
    } catch (error) {
      // Solo manejar errores reales (no el 404)
      toast.error("Error al verificar el cliente");
      console.error("Error en verificación:", error);
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

            {/** Tipo de Documento */}
            <div className="mb-3">
              <label className="form-label">Tipo de Documento:</label>
              <select
                name="tipoDocumento"
                className={`form-select ${
                  errors.tipoDocumento ? "is-invalid" : ""
                }`}
                value={formData.tipoDocumento}
                onChange={handleChange}
              >
                <option value="">Seleccione un tipo de Documento</option>
                <option value="Cédula de Ciudadanía">
                  Cédula de Ciudadanía
                </option>
                <option value="Cédula de Extranjería">
                  Cédula de Extranjería
                </option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Nit">Nit</option>
              </select>
              {errors.tipoDocumento && (
                <div className="invalid-feedback">{errors.tipoDocumento}</div>
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
                onBlur={verificarClienteExistente}
                disabled={clienteExistente}
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

            <div className="text-center mt-4" href="/Clientes">
              <BotonVolver texto="← Volver al Modulo de Clientes" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
