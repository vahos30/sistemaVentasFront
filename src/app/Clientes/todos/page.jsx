"use client";

import React, { useEffect, useState } from "react";
import { obtenerClientes } from "@/app/services/clienteServices";
import BotonVolver from "../../components/BotonVolver";

export default function TodosClientes() {
  const [clientes, setClientes] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Cargar clientes al montar el componente
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
        setFiltrados(data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarClientes();
  }, []);

  // Filtrar clientes cuando cambia la búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltrados(clientes);
      return;
    }

    const termino = busqueda.toLowerCase();
    const resultados = clientes.filter(
      (cliente) =>
        (cliente.nombre && cliente.nombre.toLowerCase().includes(termino)) ||
        (cliente.apellido &&
          cliente.apellido.toLowerCase().includes(termino)) ||
        (cliente.numeroDocumento &&
          cliente.numeroDocumento.toLowerCase().includes(termino))
    );

    setFiltrados(resultados);
  }, [busqueda, clientes]);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Clientes</h2>
        <BotonVolver texto="← Volver" className="btn-sm" />
      </div>

      {/* Campo de búsqueda */}
      <div className="input-group mb-4 shadow-sm">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, apellido o documento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          disabled={cargando}
        />
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando clientes...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow">
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>N° Documento</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? (
                filtrados.map((cliente, index) => (
                  <tr key={index}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.apellido}</td>
                    <td>{cliente.numeroDocumento}</td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.direccion}</td>
                    <td>{cliente.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    {busqueda
                      ? `No se encontraron clientes para "${busqueda}"`
                      : "No hay clientes registrados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="text-end text-muted small mt-2">
            Mostrando {filtrados.length} de {clientes.length} clientes
          </div>
        </div>
      )}
    </div>
  );
}
