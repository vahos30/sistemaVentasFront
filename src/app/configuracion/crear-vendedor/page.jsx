"use client";

import { useState } from "react";
import BotonGuardar from "@/app/components/BotonGuardar";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";
import { crearVendedor } from "@/app/services/usuariosService";

export default function CrearVendedorPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validaciones
  const regex = {
    userName: /^.{3,}$/, // mínimo 3 caracteres
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*\d).{6,}$/, // mínimo 6 caracteres, al menos un número
  };

  const mensajes = {
    userName:
      "El nombre de usuario es obligatorio y debe tener al menos 3 caracteres.",
    email: "Ingrese un correo electrónico válido.",
    password:
      "La contraseña debe tener mínimo 6 caracteres y al menos un número.",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
      const valor = formData[campo];
      if (!valor || !regex[campo].test(valor)) {
        nuevosErrores[campo] = mensajes[campo];
        if (!primerCampoConError) primerCampoConError = campo;
      }
    }

    setErrors(nuevosErrores);

    if (primerCampoConError) {
      const input = document.querySelector(`[name="${primerCampoConError}"]`);
      if (input) input.focus();
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleCrearVendedor = () => {
    if (!validarCampos()) return;

    toast(
      ({ closeToast }) => (
        <div>
          <div className="mb-2">¿Está seguro de crear el Vendedor?</div>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-success btn-sm"
              onClick={async () => {
                closeToast();
                try {
                  const mensaje = await crearVendedor(formData);
                  toast.success(`✅ ${mensaje}`);
                  setFormData({
                    userName: "",
                    email: "",
                    password: "",
                  });
                  setErrors({});
                } catch (error) {
                  toast.error(
                    `❌ ${error.message || "Error al crear el vendedor"}`
                  );
                }
              }}
            >
              Sí
            </button>
            <button className="btn btn-secondary btn-sm" onClick={closeToast}>
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">Crear Vendedor</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Nombre de usuario */}
            <div className="mb-3">
              <label className="form-label">Nombre de usuario:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.userName ? "is-invalid" : ""
                }`}
                name="userName"
                value={formData.userName}
                onChange={handleChange}
              />
              {errors.userName && (
                <div className="invalid-feedback">{errors.userName}</div>
              )}
            </div>
            {/* Correo electrónico */}
            <div className="mb-3">
              <label className="form-label">Correo electrónico:</label>
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
            {/* Contraseña */}
            <div className="mb-3">
              <label className="form-label">Contraseña:</label>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
              <div className="form-check mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="verPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label className="form-check-label" htmlFor="verPassword">
                  Mostrar contraseña
                </label>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <BotonGuardar
                onClick={handleCrearVendedor}
                texto="Crear Vendedor"
              />
            </div>
            <div className="text-center mt-4">
              <BotonVolver texto="← Regresar al Módulo de Configuración" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
