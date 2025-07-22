"use client";

import { useState } from "react";
import BotonGuardar from "@/app/components/BotonGuardar";
import BotonVolver from "@/app/components/BotonVolver";
import { crearProducto } from "@/app/services/productosService";
import { toast } from "react-toastify";

export default function CrearProductoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    referencia: "",
    precio: "",
    descripcion: "",
    cantidadStock: "",
    disponible: false,
  });

  const [errors, setErrors] = useState({});

  const regex = {
    nombre: /^.{2,}$/,
    referencia: /^.{2,}$/,
    precio: /^[0-9]+(\.[0-9]{1,2})?$/,
    descripcion: /^.{2,}$/,
    cantidadStock: /^[0-9]+$/,
  };

  const mensajes = {
    nombre: "El nombre es obligatorio.",
    referencia: "La referencia es obligatoria.",
    precio: "Ingrese un precio válido.",
    descripcion: "La descripción es obligatoria.",
    cantidadStock: "Ingrese una cantidad válida.",
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
      const valor = formData[campo];
      if (
        campo !== "disponible" &&
        (!valor || !regex[campo].test(valor.toString()))
      ) {
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

  const handleGuardar = async () => {
    if (!validarCampos()) return;

    try {
      const cantidad = parseInt(formData.cantidadStock, 10);
      const producto = {
        ...formData,
        precio: parseFloat(formData.precio),
        cantidadStock: cantidad,
        activo: cantidad > 0, // <-- Aquí se asigna automáticamente
      };
      await crearProducto(producto);
      toast.success("✅ Producto creado exitosamente");
      setFormData({
        nombre: "",
        referencia: "",
        precio: "",
        descripcion: "",
        cantidadStock: "",
        disponible: false,
      });
      setErrors({});
    } catch (error) {
      toast.error(`❌ ${error.message || "Error al guardar el producto"}`);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">Registrar Producto</h2>
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
            {/* Referencia */}
            <div className="mb-3">
              <label className="form-label">Referencia:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.referencia ? "is-invalid" : ""
                }`}
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
              />
              {errors.referencia && (
                <div className="invalid-feedback">{errors.referencia}</div>
              )}
            </div>
            {/* Precio */}
            <div className="mb-3">
              <label className="form-label">Precio:</label>
              <input
                type="number"
                min="0"
                className={`form-control ${errors.precio ? "is-invalid" : ""}`}
                name="precio"
                value={formData.precio}
                onChange={handleChange}
              />
              {errors.precio && (
                <div className="invalid-feedback">{errors.precio}</div>
              )}
            </div>
            {/* Descripción */}
            <div className="mb-3">
              <label className="form-label">Descripción:</label>
              <input
                type="text"
                className={`form-control ${
                  errors.descripcion ? "is-invalid" : ""
                }`}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
              {errors.descripcion && (
                <div className="invalid-feedback">{errors.descripcion}</div>
              )}
            </div>
            {/* Cantidad en Stock */}
            <div className="mb-3">
              <label className="form-label">Cantidad en Stock:</label>
              <input
                type="number"
                min="0"
                className={`form-control ${
                  errors.cantidadStock ? "is-invalid" : ""
                }`}
                name="cantidadStock"
                value={formData.cantidadStock}
                onChange={handleChange}
              />
              {errors.cantidadStock && (
                <div className="invalid-feedback">{errors.cantidadStock}</div>
              )}
            </div>
            <div className="d-flex justify-content-center">
              <BotonGuardar onClick={handleGuardar} texto="Guardar Producto" />
            </div>
            <div className="text-center mt-4">
              <BotonVolver texto="← Regresar al Módulo de Productos" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
