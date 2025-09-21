"use client";

import { useState, useEffect } from "react";
import BotonGuardar from "@/app/components/BotonGuardar";
import BotonVolver from "@/app/components/BotonVolver";
import {
  CrearClienteNuevo,
  actualizarCliente,
} from "@/app/services/clienteServices";
import { obtenerClientePorDocumento } from "@/app/services/clienteServices";
import { obtenerDepartamentosYCiudades } from "@/app/services/ciudadesService";
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

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudadesPorDepto, setCiudadesPorDepto] = useState({});
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [ciudades, setCiudades] = useState([]);
  const [ciudadId, setCiudadId] = useState("");

  const [idTipoDocumentoIdentidad, setIdTipoDocumentoIdentidad] = useState("");
  const [idTipoOrganizacion, setIdTipoOrganizacion] = useState("");
  const [idTributo, setIdTributo] = useState("");
  const [razonSocial, setRazonSocial] = useState("");

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

  const regex = {
    nombre: /^[a-zA-ZÀ-ÿ\s]+$/,
    apellido: /^[a-zA-ZÀ-ÿ\s]+$/,
    tipoDocumento: new RegExp(
      `^(${tiposDocumento.map((t) => t.nombre).join("|")})$`
    ),
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

    // Validar campos de formData
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

    // Validar tipo de documento (select)
    if (!idTipoDocumentoIdentidad) {
      nuevosErrores.tipoDocumento = "Este campo es obligatorio";
      if (!primerCampoConError) primerCampoConError = "tipoDocumento";
    }

    // Validar departamento
    if (!departamentoSeleccionado) {
      nuevosErrores.departamento = "Este campo es obligatorio";
      if (!primerCampoConError) primerCampoConError = "departamento";
    }

    // Validar ciudad
    if (!ciudadId) {
      nuevosErrores.ciudad = "Este campo es obligatorio";
      if (!primerCampoConError) primerCampoConError = "ciudad";
    }

    // Validar campos NIT si aplica
    if (formData.tipoDocumento === "NIT") {
      if (!idTipoOrganizacion) {
        nuevosErrores.idTipoOrganizacion = "Este campo es obligatorio";
        if (!primerCampoConError) primerCampoConError = "idTipoOrganizacion";
      }
      if (!idTributo) {
        nuevosErrores.idTributo = "Este campo es obligatorio";
        if (!primerCampoConError) primerCampoConError = "idTributo";
      }
      if (!razonSocial.trim()) {
        nuevosErrores.razonSocial = "Este campo es obligatorio";
        if (!primerCampoConError) primerCampoConError = "razonSocial";
      }
    }

    setErrors(nuevosErrores);

    // Enfocar el primer campo con error
    if (primerCampoConError) {
      const input =
        document.querySelector(`input[name="${primerCampoConError}"]`) ||
        document.querySelector(`select[name="${primerCampoConError}"]`);
      if (input) input.focus();
    }

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarCampos()) return;
    if (!ciudadId) {
      toast.error("Debe seleccionar una ciudad.");
      return;
    }
    if (!idTipoDocumentoIdentidad) {
      toast.error("Debe seleccionar un tipo de documento.");
      return;
    }
    try {
      let datosCliente = {
        ...formData,
        ciudadId,
        idTipoDocumentoIdentidad: Number(idTipoDocumentoIdentidad),
      };

      if (formData.tipoDocumento === "NIT") {
        if (!idTipoOrganizacion || !idTributo || !razonSocial) {
          toast.error("Debe completar todos los campos de NIT.");
          return;
        }
        datosCliente = {
          ...datosCliente,
          idTipoOrganizacion: Number(idTipoOrganizacion),
          idTributo: Number(idTributo),
          razonSocial,
        };
      } else {
        // Si NO es NIT, siempre envía idTributo = 21
        datosCliente = {
          ...datosCliente,
          idTributo: 21,
        };
      }

      if (clienteExistente && clienteId) {
        await actualizarCliente(clienteId, { ...datosCliente, Id: clienteId });
        toast.success("✅ Cliente actualizado exitosamente");
      } else {
        await CrearClienteNuevo(datosCliente);
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
      setDepartamentoSeleccionado("");
      setCiudadId("");
      setIdTipoDocumentoIdentidad("");
      setIdTipoOrganizacion("");
      setIdTributo("");
      setRazonSocial("");
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

  useEffect(() => {
    // Cargar departamentos y ciudades al montar
    const cargarCiudades = async () => {
      try {
        const data = await obtenerDepartamentosYCiudades();
        setDepartamentos(Object.keys(data));
        setCiudadesPorDepto(data);
      } catch {
        toast.error("No se pudo cargar la información de ciudades");
      }
    };
    cargarCiudades();
  }, []);

  // Cuando cambia el departamento, actualiza las ciudades
  useEffect(() => {
    if (
      departamentoSeleccionado &&
      ciudadesPorDepto[departamentoSeleccionado]
    ) {
      setCiudades(ciudadesPorDepto[departamentoSeleccionado]);
    } else {
      setCiudades([]);
    }
    setCiudadId("");
  }, [departamentoSeleccionado, ciudadesPorDepto]);

  // Actualiza el handleChange para tipoDocumento
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
    setErrors({
      ...errors,
      tipoDocumento: "",
    });
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">Registrar Cliente</h2>

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

            {/* Apellido */}
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

            {/* Tipo de Documento */}
            <div className="mb-3">
              <label className="form-label">Tipo de Documento:</label>
              <select
                name="tipoDocumento"
                className={`form-select ${
                  errors.tipoDocumento ? "is-invalid" : ""
                }`}
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
              {errors.tipoDocumento && (
                <div className="invalid-feedback">{errors.tipoDocumento}</div>
              )}
            </div>

            {/* Número de Documento */}
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

            {/* Campos NIT justo debajo de Número de Documento */}
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
                  {errors.idTipoOrganizacion && (
                    <div className="invalid-feedback d-block">
                      {errors.idTipoOrganizacion}
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
                  {errors.idTributo && (
                    <div className="invalid-feedback d-block">
                      {errors.idTributo}
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
                  {errors.razonSocial && (
                    <div className="invalid-feedback d-block">
                      {errors.razonSocial}
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

            {/* Dirección */}
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
              {errors.departamento && (
                <div className="invalid-feedback d-block">
                  {errors.departamento}
                </div>
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
              {errors.ciudad && (
                <div className="invalid-feedback d-block">{errors.ciudad}</div>
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
