// app/components/FormularioCliente.jsx
import React from "react";

export default function FormularioCliente({
  datosIniciales,
  onSubmit,
  modoEdicion = false,
  errores = {},
}) {
  // Estado para manejar los datos del formulario
  const [formData, setFormData] = React.useState(
    datosIniciales || {
      nombre: "",
      apellido: "",
      numeroDocumento: "",
      telefono: "",
      direccion: "",
      email: "",
    }
  );

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card shadow">
      <div className="card-body">
        <h3 className="card-title mb-4">
          {modoEdicion ? "Editar Cliente" : "Crear Nuevo Cliente"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Campo Nombre */}
            <div className="col-md-6">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className={`form-control ${errores.nombre ? "is-invalid" : ""}`}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              {errores.nombre && (
                <div className="invalid-feedback">{errores.nombre}</div>
              )}
            </div>

            {/* Campo Apellido */}
            <div className="col-md-6">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                className={`form-control ${
                  errores.apellido ? "is-invalid" : ""
                }`}
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
              {errores.apellido && (
                <div className="invalid-feedback">{errores.apellido}</div>
              )}
            </div>

            {/* Campo Documento */}
            <div className="col-md-6">
              <label className="form-label">N° Documento *</label>
              <input
                type="text"
                className={`form-control ${
                  errores.numeroDocumento ? "is-invalid" : ""
                }`}
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                required
                disabled={modoEdicion}
              />
              {errores.numeroDocumento && (
                <div className="invalid-feedback">
                  {errores.numeroDocumento}
                </div>
              )}
              <div className="form-text">
                {modoEdicion
                  ? "Documento no modificable"
                  : "Identificación única"}
              </div>
            </div>

            {/* Campo Teléfono */}
            <div className="col-md-6">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-control"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            {/* Campo Dirección */}
            <div className="col-12">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className="form-control"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            {/* Campo Email */}
            <div className="col-md-12">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-control ${errores.email ? "is-invalid" : ""}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errores.email && (
                <div className="invalid-feedback">{errores.email}</div>
              )}
            </div>

            {/* Botón de envío */}
            <div className="col-12 mt-4">
              <button type="submit" className="btn btn-primary">
                {modoEdicion ? "Actualizar Cliente" : "Crear Cliente"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
