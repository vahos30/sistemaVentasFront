// app/components/FormularioCliente.jsx
import React, { useState, useEffect } from "react";
import { obtenerDepartamentosYCiudades } from "@/app/services/ciudadesService";

const tiposDocumento = [
  { id: 1, nombre: "Registro civil" },
  { id: 2, nombre: "Tarjeta de identidad" },
  { id: 3, nombre: "Cédula de ciudadanía" },
  { id: 4, nombre: "Tarjeta de extranjería" },
  { id: 5, nombre: "Cédula de extranjería" },
  { id: 6, nombre: "NIT" },
  { id: 7, nombre: "Pasaporte" },
  { id: 8, nombre: "Documento de identificación extranjero" },
  { id: 9, nombre: "PEP" },
  { id: 10, nombre: "NIT otro país" },
  { id: 11, nombre: "NUIP" },
];

const tiposOrganizacion = [
  { id: 1, nombre: "Persona Jurídica" },
  { id: 2, nombre: "Persona Natural" },
];

const tributos = [
  { id: 18, nombre: "IVA" },
  { id: 21, nombre: "No aplica" },
];

export default function FormularioCliente({
  datosIniciales,
  onSubmit,
  errores = {},
  modoEdicion = false,
}) {
  const [formData, setFormData] = useState({ ...datosIniciales });
  const [idTipoDocumentoIdentidad, setIdTipoDocumentoIdentidad] = useState(
    datosIniciales.idTipoDocumentoIdentidad?.toString() || ""
  );
  const [idTipoOrganizacion, setIdTipoOrganizacion] = useState(
    datosIniciales.idTipoOrganizacion?.toString() || ""
  );
  const [idTributo, setIdTributo] = useState(
    datosIniciales.idTributo?.toString() || ""
  );
  const [razonSocial, setRazonSocial] = useState(
    datosIniciales.razonSocial || ""
  );
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudadesPorDepto, setCiudadesPorDepto] = useState({});
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(
    datosIniciales.departamento || ""
  );
  const [ciudades, setCiudades] = useState([]);
  const [ciudadId, setCiudadId] = useState(
    datosIniciales.ciudadId?.toString() || ""
  );

  useEffect(() => {
    const cargarCiudades = async () => {
      try {
        const data = await obtenerDepartamentosYCiudades();
        setDepartamentos(Object.keys(data));
        setCiudadesPorDepto(data);
      } catch {
        // Manejar error si es necesario
      }
    };
    cargarCiudades();
  }, []);

  useEffect(() => {
    if (
      departamentoSeleccionado &&
      ciudadesPorDepto[departamentoSeleccionado]
    ) {
      setCiudades(ciudadesPorDepto[departamentoSeleccionado]);
    } else {
      setCiudades([]);
    }
  }, [departamentoSeleccionado, ciudadesPorDepto]);

  useEffect(() => {
    setFormData({
      ...datosIniciales,
      NumeroDocumento:
        datosIniciales.NumeroDocumento || datosIniciales.numeroDocumento || "",
    });
    setIdTipoDocumentoIdentidad(
      datosIniciales.idTipoDocumentoIdentidad?.toString() || ""
    );
    setIdTipoOrganizacion(datosIniciales.idTipoOrganizacion?.toString() || "");
    setIdTributo(datosIniciales.idTributo?.toString() || "");
    setRazonSocial(datosIniciales.razonSocial || "");
    setDepartamentoSeleccionado(datosIniciales.departamento || "");
    setCiudadId(datosIniciales.ciudadId?.toString() || "");
  }, [datosIniciales]);

  // Actualiza tipo de documento y campos dependientes
  const handleTipoDocumentoChange = (e) => {
    const selectedId = e.target.value;
    const selectedTipo = tiposDocumento.find(
      (t) => t.id.toString() === selectedId
    );
    setIdTipoDocumentoIdentidad(selectedId);
    setFormData({
      ...formData,
      tipoDocumento: selectedTipo ? selectedTipo.nombre : "",
    });
  };

  // Actualiza campos generales
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      idTipoDocumentoIdentidad: Number(idTipoDocumentoIdentidad),
      idTipoOrganizacion: idTipoOrganizacion
        ? Number(idTipoOrganizacion)
        : null,
      idTributo: idTributo ? Number(idTributo) : null,
      razonSocial,
      ciudadId: ciudadId ? Number(ciudadId) : null,
      departamento: departamentoSeleccionado,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Nombre */}
      <div className="mb-3">
        <label className="form-label">Nombre:</label>
        <input
          type="text"
          className={`form-control ${errores.nombre ? "is-invalid" : ""}`}
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
        />
        {errores.nombre && (
          <div className="invalid-feedback">{errores.nombre}</div>
        )}
      </div>

      {/* Apellido */}
      <div className="mb-3">
        <label className="form-label">Apellido:</label>
        <input
          type="text"
          className={`form-control ${errores.apellido ? "is-invalid" : ""}`}
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
        />
        {errores.apellido && (
          <div className="invalid-feedback">{errores.apellido}</div>
        )}
      </div>

      {/* Tipo de Documento */}
      <div className="mb-3">
        <label className="form-label">Tipo de Documento:</label>
        <select
          name="tipoDocumento"
          className={`form-select ${errores.tipoDocumento ? "is-invalid" : ""}`}
          value={idTipoDocumentoIdentidad}
          onChange={handleTipoDocumentoChange}
        >
          <option value="">Seleccione un tipo de Documento</option>
          {tiposDocumento.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
        {errores.tipoDocumento && (
          <div className="invalid-feedback">{errores.tipoDocumento}</div>
        )}
      </div>

      {/* Número de Documento (NO editable, pero visible) */}
      <div className="mb-3">
        <label className="form-label">Número de Documento:</label>
        <input
          type="text"
          className={`form-control ${
            errores.NumeroDocumento ? "is-invalid" : ""
          }`}
          name="NumeroDocumento"
          value={formData.NumeroDocumento || ""}
          disabled
          readOnly
        />
        {errores.NumeroDocumento && (
          <div className="invalid-feedback">{errores.NumeroDocumento}</div>
        )}
      </div>

      {/* Campos NIT */}
      {formData.tipoDocumento === "NIT" && (
        <>
          {/* Tipo de Organización */}
          <div className="mb-3">
            <label className="form-label">Tipo de Organización:</label>
            <select
              className="form-select"
              value={idTipoOrganizacion}
              onChange={(e) => setIdTipoOrganizacion(e.target.value)}
              name="idTipoOrganizacion"
            >
              <option value="">Seleccione tipo de organización</option>
              {tiposOrganizacion.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nombre}
                </option>
              ))}
            </select>
            {errores.idTipoOrganizacion && (
              <div className="invalid-feedback d-block">
                {errores.idTipoOrganizacion}
              </div>
            )}
          </div>

          {/* Tributo */}
          <div className="mb-3">
            <label className="form-label">Tributo:</label>
            <select
              className="form-select"
              value={idTributo}
              onChange={(e) => setIdTributo(e.target.value)}
              name="idTributo"
            >
              <option value="">Seleccione tributo</option>
              {tributos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {errores.idTributo && (
              <div className="invalid-feedback d-block">
                {errores.idTributo}
              </div>
            )}
          </div>

          {/* Razón Social */}
          <div className="mb-3">
            <label className="form-label">Razón Social:</label>
            <input
              type="text"
              className="form-control"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              name="razonSocial"
            />
            {errores.razonSocial && (
              <div className="invalid-feedback d-block">
                {errores.razonSocial}
              </div>
            )}
          </div>
        </>
      )}

      {/* Teléfono */}
      <div className="mb-3">
        <label className="form-label">Teléfono:</label>
        <input
          type="text"
          className={`form-control ${errores.telefono ? "is-invalid" : ""}`}
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
        />
        {errores.telefono && (
          <div className="invalid-feedback">{errores.telefono}</div>
        )}
      </div>

      {/* Dirección */}
      <div className="mb-3">
        <label className="form-label">Dirección:</label>
        <input
          type="text"
          className={`form-control ${errores.direccion ? "is-invalid" : ""}`}
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
        />
        {errores.direccion && (
          <div className="invalid-feedback">{errores.direccion}</div>
        )}
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="form-label">Email:</label>
        <input
          type="email"
          className={`form-control ${errores.email ? "is-invalid" : ""}`}
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errores.email && (
          <div className="invalid-feedback">{errores.email}</div>
        )}
      </div>

      {/* Departamento */}
      <div className="mb-3">
        <label className="form-label">Departamento:</label>
        <select
          className="form-select"
          value={departamentoSeleccionado}
          onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
          name="departamento"
        >
          <option value="">Seleccione un departamento</option>
          {departamentos.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
        {errores.departamento && (
          <div className="invalid-feedback d-block">{errores.departamento}</div>
        )}
      </div>

      {/* Ciudad */}
      <div className="mb-3">
        <label className="form-label">Ciudad:</label>
        <select
          className="form-select"
          value={ciudadId}
          onChange={(e) => setCiudadId(e.target.value)}
          disabled={!departamentoSeleccionado}
          name="ciudad"
        >
          <option value="">Seleccione una ciudad</option>
          {ciudades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errores.ciudad && (
          <div className="invalid-feedback d-block">{errores.ciudad}</div>
        )}
      </div>

      <div className="d-flex justify-content-center">
        <button type="submit" className="btn btn-success">
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
