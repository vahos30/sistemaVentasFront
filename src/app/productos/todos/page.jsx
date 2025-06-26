"use client";

import React, { useEffect, useState, useRef } from "react";
import { obtenerProductos } from "@/app/services/productosService";
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Productos</h2>
        <BotonVolver texto="← Volver al Menú" />
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
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
