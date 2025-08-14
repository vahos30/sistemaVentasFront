"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  obtenerProveedores,
  eliminarProveedor,
} from "@/app/services/proveedorService";
import BotonVolver from "../../components/BotonVolver";
import Link from "next/link";
import { toast } from "react-toastify";

export default function TodosProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const isFirstRun = useRef(true);
  const TOAST_ID_PROVEEDORES = "proveedores-cargados";

  useEffect(() => {
    if (!isFirstRun.current) return;
    isFirstRun.current = false;

    const cargarProveedores = async () => {
      try {
        const data = await obtenerProveedores();
        setProveedores(data);
        setFiltrados(data);
        toast.success("Proveedores cargados exitosamente", {
          autoClose: 2000,
          icon: "🏢",
          toastId: TOAST_ID_PROVEEDORES,
        });
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
        toast.error("Error al cargar proveedores: " + error.message, {
          autoClose: 2000,
        });
      } finally {
        setCargando(false);
      }
    };

    cargarProveedores();
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltrados(proveedores);
      return;
    }

    const termino = busqueda.toLowerCase();
    const resultados = proveedores.filter(
      (proveedor) =>
        (proveedor.nombre &&
          proveedor.nombre.toLowerCase().includes(termino)) ||
        (proveedor.razonSocial &&
          proveedor.razonSocial.toLowerCase().includes(termino)) ||
        (proveedor.nit && proveedor.nit.toLowerCase().includes(termino)) ||
        (proveedor.telefono &&
          proveedor.telefono.toLowerCase().includes(termino)) ||
        (proveedor.email && proveedor.email.toLowerCase().includes(termino))
    );

    setFiltrados(resultados);

    if (resultados.length === 0 && busqueda.trim()) {
      toast.info(`No se encontraron proveedores para "${busqueda}"`, {
        autoClose: 2000,
      });
    }
  }, [busqueda, proveedores]);

  const ejecutarEliminacion = async (id) => {
    try {
      await eliminarProveedor(id);
      const nuevosProveedores = proveedores.filter((p) => p.id !== id);
      setProveedores(nuevosProveedores);
      setFiltrados(filtrados.filter((p) => p.id !== id));
      toast.success("Proveedor eliminado exitosamente", {
        icon: "🗑️",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Error al eliminar proveedor: " + error.message, {
        autoClose: 2000,
      });
    }
  };

  const confirmarEliminacion = (id) => {
    toast.info(
      <div>
        <p className="mb-2">
          ¿Está seguro de eliminar este proveedor? Esta acción no se puede
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
        <h2>Listado de Proveedores</h2>
        <BotonVolver
          href="/Proveedor"
          texto="← Volver al Modulo de Proveedores"
          className="btn-sm"
        />
      </div>

      <div className="mb-4 text-end">
        <Link
          href="/proveedor/nuevo"
          className="btn btn-info"
          onClick={() =>
            toast.info("Creando nuevo proveedor...", {
              autoClose: 2000,
            })
          }
        >
          + Nuevo Proveedor
        </Link>
      </div>

      <div className="input-group mb-4 shadow-sm">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre, razón social, NIT, teléfono o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          disabled={cargando}
        />
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando proveedores...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow">
            <thead className="table-info">
              <tr>
                <th>Nombre</th>
                <th>Razón Social</th>
                <th>NIT</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? (
                filtrados.map((proveedor) => (
                  <tr key={proveedor.id}>
                    <td>{proveedor.nombre}</td>
                    <td>{proveedor.razonSocial}</td>
                    <td>{proveedor.nit}</td>
                    <td>{proveedor.telefono}</td>
                    <td>{proveedor.email}</td>
                    <td>
                      {proveedor.activo ? (
                        <span className="badge bg-success">Sí</span>
                      ) : (
                        <span className="badge bg-danger">No</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link
                          href={`/proveedor/editar/${proveedor.id}`}
                          className="btn btn-sm btn-warning"
                          onClick={() =>
                            toast.info("Editando proveedor...", {
                              autoClose: 2000,
                            })
                          }
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => confirmarEliminacion(proveedor.id)}
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
                      ? `No se encontraron proveedores para "${busqueda}"`
                      : "No hay proveedores registrados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="text-end text-muted small mt-2">
            Mostrando {filtrados.length} de {proveedores.length} proveedores
          </div>
        </div>
      )}
    </div>
  );
}
