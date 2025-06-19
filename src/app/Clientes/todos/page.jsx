"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  obtenerClientes,
  eliminarCliente,
} from "@/app/services/clienteServices";
import BotonVolver from "../../components/BotonVolver";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function TodosClientes() {
  const [clientes, setClientes] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();
  const isFirstRun = useRef(true);
  const TOAST_ID_CLIENTES = "clientes-cargados"; // ✅ ID único para evitar cierres innecesarios

  // Cargar clientes al montar el componente
  useEffect(() => {
    if (!isFirstRun.current) return;
    isFirstRun.current = false;

    const cargarClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
        setFiltrados(data);
        toast.success("Clientes cargados exitosamente", {
          autoClose: 2000,
          icon: "👥",
          toastId: TOAST_ID_CLIENTES, // ✅ evita duplicados o cierres accidentales
        });
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast.error("Error al cargar clientes: " + error.message, {
          autoClose: 2000,
        });
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
      return; // ✅ ya no se usa toast.dismiss()
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

    if (resultados.length === 0 && busqueda.trim()) {
      toast.info(`No se encontraron clientes para "${busqueda}"`, {
        autoClose: 2000,
      });
    }
  }, [busqueda, clientes]);

  const ejecutarEliminacion = async (id) => {
    try {
      await eliminarCliente(id);
      const nuevosClientes = clientes.filter((cliente) => cliente.id !== id);
      setClientes(nuevosClientes);
      setFiltrados(filtrados.filter((cliente) => cliente.id !== id));

      toast.success("Cliente eliminado exitosamente", {
        icon: "🗑️",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Error al eliminar cliente: " + error.message, {
        autoClose: 2000,
      });
    }
  };

  const confirmarEliminacion = (id) => {
    toast.info(
      <div>
        <p className="mb-2">
          ¿Está seguro de eliminar este cliente? Esta acción no se puede
          deshacer.
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => toast.dismiss()}
          >
            Cancelar
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              toast.dismiss();
              ejecutarEliminacion(id);
            }}
          >
            Eliminar
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        className: "toast-confirmacion",
      }
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Clientes</h2>
        <BotonVolver
          href="/Clientes"
          texto="← Volver al Modulo de Clientes"
          className="btn-sm"
        />
      </div>

      <div className="mb-4 text-end">
        <Link
          href="/Clientes/nuevo"
          className="btn btn-primary"
          onClick={() =>
            toast.info("Creando nuevo cliente...", {
              autoClose: 2000,
            })
          }
        >
          + Nuevo Cliente
        </Link>
      </div>

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
                <th>Tipo Documento</th>
                <th>N° Documento</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? (
                filtrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.apellido}</td>
                    <td>{cliente.tipoDocumento}</td>
                    <td>{cliente.numeroDocumento}</td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.direccion}</td>
                    <td>{cliente.email}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link
                          href={`/Clientes/editar/${cliente.id}`}
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            toast.info("Editando cliente...", {
                              autoClose: 2000,
                            })
                          }
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => confirmarEliminacion(cliente.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
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
