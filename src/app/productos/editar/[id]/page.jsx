"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerProductos,
  actualizarProducto,
} from "@/app/services/productosService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";

export default function EditarProducto({ params }) {
  const { id } = React.use(params);
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  // Cargar producto al montar el componente
  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const data = await obtenerProductos();
        const prod = data.find((p) => p.id === id);
        setProducto(prod);
        setErrores({});
      } catch (error) {
        toast.error(`Error al cargar el producto: ${error.message}`);
        setErrores({ general: error.message });
      } finally {
        setCargando(false);
      }
    };
    cargarProducto();
  }, [id]);

  useEffect(() => {
    if (producto) {
      const cantidad = parseInt(producto.cantidadStock, 10);
      setProducto((prev) => ({
        ...prev,
        activo: cantidad > 0,
      }));
    }
  }, [producto?.cantidadStock]);

  // Validación simple
  const validar = () => {
    const nuevosErrores = {};
    if (!producto.nombre) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!producto.precio || isNaN(producto.precio))
      nuevosErrores.precio = "Precio inválido";
    if (!producto.descripcion)
      nuevosErrores.descripcion = "La descripción es obligatoria";
    if (!producto.cantidadStock || isNaN(producto.cantidadStock))
      nuevosErrores.cantidadStock = "Cantidad inválida";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar actualización del producto
  const handleActualizar = async (e) => {
    e.preventDefault();
    setErrores({});
    if (!validar()) return;
    setEnviando(true);
    try {
      await actualizarProducto(id, {
        id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        descripcion: producto.descripcion,
        cantidadStock: parseInt(producto.cantidadStock, 10),
        referencia: producto.referencia,
        activo: producto.activo, // <-- aquí se envía el valor actualizado
      });
      toast.success("¡Producto actualizado exitosamente!", {
        position: "top-center",
        autoClose: 1000,
        onClose: () => router.replace("/productos/todos"),
      });
    } catch (error) {
      setErrores({ general: error.message });
      toast.error(`Error al actualizar: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setEnviando(false);
    }
  };

  // Mostrar loader mientras carga
  if (cargando) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Cargando producto...</p>
      </div>
    );
  }

  // Mostrar error si no se encontró el producto
  if (!producto) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Error al cargar el producto</h4>
          <p>
            {errores.general ||
              "El producto solicitado no existe o no se pudo cargar."}
          </p>
          <BotonVolver
            texto="Volver al listado"
            onClick={() => router.replace("/productos/todos")}
            className="mt-3"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Editar Producto</h2>
        <BotonVolver
          texto="← Volver al listado"
          onClick={() => router.push("/productos/todos")}
        />
      </div>

      {errores.general && (
        <div className="alert alert-danger mb-4">{errores.general}</div>
      )}

      <form
        onSubmit={handleActualizar}
        className="card shadow p-4 mx-auto"
        style={{ maxWidth: 600 }}
      >
        <div className="mb-3">
          <label className="form-label">Nombre:</label>
          <input
            type="text"
            className={`form-control ${errores.nombre ? "is-invalid" : ""}`}
            name="nombre"
            value={producto.nombre}
            onChange={(e) =>
              setProducto({ ...producto, nombre: e.target.value })
            }
          />
          {errores.nombre && (
            <div className="invalid-feedback">{errores.nombre}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Referencia:</label>
          <input
            type="text"
            className="form-control"
            name="referencia"
            value={producto.referencia}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Precio:</label>
          <input
            type="number"
            className={`form-control ${errores.precio ? "is-invalid" : ""}`}
            name="precio"
            value={producto.precio}
            onChange={(e) =>
              setProducto({ ...producto, precio: e.target.value })
            }
          />
          {errores.precio && (
            <div className="invalid-feedback">{errores.precio}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción:</label>
          <input
            type="text"
            className={`form-control ${
              errores.descripcion ? "is-invalid" : ""
            }`}
            name="descripcion"
            value={producto.descripcion}
            onChange={(e) =>
              setProducto({ ...producto, descripcion: e.target.value })
            }
          />
          {errores.descripcion && (
            <div className="invalid-feedback">{errores.descripcion}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Cantidad en Stock:</label>
          <input
            type="number"
            className={`form-control ${
              errores.cantidadStock ? "is-invalid" : ""
            }`}
            name="cantidadStock"
            value={producto.cantidadStock}
            onChange={(e) =>
              setProducto({ ...producto, cantidadStock: e.target.value })
            }
          />
          {errores.cantidadStock && (
            <div className="invalid-feedback">{errores.cantidadStock}</div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Producto Disponible:</label>
          <div>
            {producto.activo ? (
              <span className="badge bg-success">Sí, disponible</span>
            ) : (
              <span className="badge bg-danger">No disponible</span>
            )}
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>

      {enviando && (
        <div className="overlay-envio">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Actualizando...</span>
          </div>
          <p className="mt-2">Actualizando producto...</p>
        </div>
      )}
    </div>
  );
}
