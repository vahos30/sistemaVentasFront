"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  obtenerProductos,
  eliminarProducto,
} from "@/app/services/productosService";
import BotonVolver from "../../components/BotonVolver";
import { toast } from "react-toastify";

export default function TodosProductos() {
  const [productos, setProductos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const toastMostrado = useRef(false);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
        setFiltrados(data);
        if (!toastMostrado.current) {
          toast.success("Productos cargados exitosamente", {
            autoClose: 2000,
            icon: "📦",
          });
          toastMostrado.current = true;
        }
      } catch (error) {
        toast.error("Error al cargar productos: " + error.message, {
          autoClose: 2000,
        });
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  // Filtrar productos cuando cambia la búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltrados(productos);
      return;
    }
    const termino = busqueda.toLowerCase();
    const resultados = productos.filter(
      (producto) =>
        (producto.nombre && producto.nombre.toLowerCase().includes(termino)) ||
        (producto.referencia &&
          producto.referencia.toLowerCase().includes(termino))
    );
    setFiltrados(resultados);
  }, [busqueda, productos]);

  const ejecutarEliminacion = async (id) => {
    try {
      await eliminarProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      setFiltrados((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado exitosamente", {
        icon: "🗑️",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(
        "No se puede eliminar el prodcuto por que esta asociado a una compra, recibo o Factura: " +
          error.message,
        {
          autoClose: 4000,
        }
      );
    }
  };

  const confirmarEliminacion = (id) => {
    toast.info(
      <div>
        <p className="mb-2">
          ¿Está seguro de eliminar este producto? Esta acción no podrá
          deshacerse.
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
        <h2>Listado de Productos</h2>
        <BotonVolver texto="← Volver al Modulo de Productos" />
      </div>

      {/* Barra de búsqueda */}
      <div className="input-group mb-4 shadow-sm">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre o referencia..."
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
          <p className="mt-2 text-muted">Cargando productos...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow">
            <thead className="table-dark">
              <tr>
                <th>Nombre del Producto</th>
                <th>Precio</th>
                <th>Descripción</th>
                <th>Referencia</th>
                <th>Cantidad en Stock</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? (
                filtrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.nombre}</td>
                    <td>${producto.precio}</td>
                    <td>{producto.descripcion}</td>
                    <td>{producto.referencia}</td>
                    <td>{producto.cantidadStock}</td>
                    <td>
                      {producto.cantidadStock > 0 ? (
                        <span className="badge bg-success">Sí</span>
                      ) : (
                        <span className="badge bg-danger">No</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <a
                          href={`/productos/editar/${producto.id}`}
                          className="btn btn-sm btn-warning"
                        >
                          Editar
                        </a>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => confirmarEliminacion(producto.id)}
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
                      ? `No se encontraron productos para "${busqueda}"`
                      : "No hay productos registrados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-end text-muted small mt-2">
            Mostrando {filtrados.length}{" "}
            {filtrados.length === 1 ? "producto" : "productos"}
          </div>
        </div>
      )}
    </div>
  );
}
