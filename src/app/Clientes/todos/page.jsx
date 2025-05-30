"use client";

import React, { useEffect, useState } from "react";
import { obtenerClientes } from "@/app/services/clienteServices";

export default function TodosClientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Simulación de carga de datos desde el backend
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarClientes();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Listado de Clientes</h2>

      {cargando ? (
        <p className="text-muted">Cargando clientes...</p>
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
              {clientes.length > 0 ? (
                clientes.map((cliente, index) => (
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
                  <td colSpan={6} className="text-center text-muted">
                    No hay clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
