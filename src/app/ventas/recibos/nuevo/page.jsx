"use client";

import React, { useState, useEffect } from "react";
import { obtenerClientes } from "@/app/services/clienteServices";
import { obtenerProductos } from "@/app/services/productosService";
import { crearRecibo } from "@/app/services/recibosService";
import BotonBuscar from "@/app/components/BotonBuscar";
import BotonAgregar from "@/app/components/BotonAgregar";
import BotonCrear from "@/app/components/BotonCrear";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

export default function CrearReciboPage() {
  // Cliente
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cliente, setCliente] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Productos
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [productosRecibo, setProductosRecibo] = useState([]);
  const [reciboCreado, setReciboCreado] = useState(null);
  const [creando, setCreando] = useState(false);

  // Cargar productos disponibles
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data.filter((p) => p.cantidadStock > 0));
      } catch {
        toast.error("Error al cargar productos");
      }
    };
    cargarProductos();
  }, []);

  // Buscar cliente por número de documento
  const handleBuscarCliente = async () => {
    setCliente(null);
    if (!numeroDocumento.trim()) {
      toast.error("Por favor ingrese un número de documento.");
      return;
    }
    setBuscando(true);
    try {
      const clientes = await obtenerClientes();
      const encontrado = clientes.find(
        (c) => c.numeroDocumento === numeroDocumento.trim()
      );
      if (encontrado) {
        setCliente(encontrado);
        toast.success("Datos del cliente cargados exitosamente");
      } else {
        toast.error("El documento ingresado no está registrado en el sistema");
      }
    } catch (error) {
      toast.error("Error al buscar el cliente");
    } finally {
      setBuscando(false);
    }
  };

  // Filtrar productos por nombre o referencia
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.referencia.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  // Seleccionar producto
  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
  };

  // Agregar producto al recibo
  const handleAgregarProducto = () => {
    if (!productoSeleccionado) return;
    if (cantidad < 1 || cantidad > productoSeleccionado.cantidadStock) {
      toast.error("Cantidad inválida");
      return;
    }
    setProductosRecibo((prev) => [
      ...prev,
      {
        ...productoSeleccionado,
        cantidad,
        subtotal: cantidad * productoSeleccionado.precio,
      },
    ]);
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidad(1);
  };

  // Eliminar producto de la lista
  const handleEliminarProducto = (id) => {
    setProductosRecibo((prev) => prev.filter((p) => p.id !== id));
  };

  // Crear recibo en PDF
  const handleCrearRecibo = async () => {
    if (!cliente || productosRecibo.length === 0) {
      toast.error("Debe seleccionar un cliente y al menos un producto.");
      return;
    }
    setCreando(true);
    try {
      const recibo = {
        clienteId: cliente.id,
        fecha: new Date().toISOString(),
        detalles: productosRecibo.map((p) => ({
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          productoId: p.id,
        })),
      };
      const data = await crearRecibo(recibo);
      setReciboCreado({
        ...data,
        cliente,
        detalles: data.detalles.map((d) => ({
          ...d,
          ...productos.find((p) => p.id === d.productoId),
        })),
      });
      toast.success("Recibo creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el recibo");
    } finally {
      setCreando(false);
    }
  };

  const descargarPDF = (recibo) => {
    const doc = new jsPDF();
    const numeroRecibo = recibo.id ? recibo.id.slice(-12) : "";
    doc.setFontSize(16);
    doc.text("Recibo de Compra", 14, 18);

    doc.setFontSize(12);
    doc.text(`Número de Recibo: ${numeroRecibo}`, 14, 26);

    doc.setFontSize(12);
    doc.text(
      `Cliente: ${recibo.cliente.nombre} ${recibo.cliente.apellido}`,
      14,
      38
    );
    doc.text(
      `Documento: ${recibo.cliente.tipoDocumento} ${recibo.cliente.numeroDocumento}`,
      14,
      46
    );
    doc.text(`Fecha: ${new Date(recibo.fecha).toLocaleString()}`, 14, 54);

    doc.setFontSize(13);
    doc.text("Detalles:", 14, 66);

    let y = 74;
    doc.setFontSize(11);
    doc.text("Producto", 14, y);
    doc.text("Referencia", 60, y);
    doc.text("Precio Unit.", 100, y);
    doc.text("Cantidad", 140, y);
    doc.text("Subtotal", 170, y);

    y += 7;
    recibo.detalles.forEach((d) => {
      doc.text(d.nombre, 14, y);
      doc.text(d.referencia, 60, y);
      doc.text(`$${d.precioUnitario.toLocaleString()}`, 100, y);
      doc.text(String(d.cantidad), 140, y);
      doc.text(`$${(d.precioUnitario * d.cantidad).toLocaleString()}`, 170, y);
      y += 7;
    });

    doc.save(`recibo_${recibo.id ? recibo.id.slice(-12) : Date.now()}.pdf`);
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center text-primary">
            Crear Recibo de Compra
          </h2>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Buscar cliente */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Ingrese el número de documento del cliente:
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Número de documento"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  disabled={buscando}
                />
                <BotonBuscar
                  onClick={handleBuscarCliente}
                  texto={buscando ? "Buscando..." : "Buscar"}
                  className="ms-2"
                />
              </div>
            </div>
            {cliente && (
              <div className="alert alert-success mt-3">
                <strong>Cliente encontrado:</strong>
                <div>
                  Nombre: {cliente.nombre} {cliente.apellido}
                </div>
                <div>Tipo Documento: {cliente.tipoDocumento}</div>
                <div>Número Documento: {cliente.numeroDocumento}</div>
                <div>Teléfono: {cliente.telefono}</div>
                <div>Dirección: {cliente.direccion}</div>
                <div>Email: {cliente.email}</div>
              </div>
            )}

            {/* Buscar y agregar productos */}
            {cliente && (
              <>
                <hr className="my-4" />
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Buscar producto por nombre o referencia:
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar producto..."
                      value={busquedaProducto}
                      onChange={(e) => {
                        setBusquedaProducto(e.target.value);
                        setProductoSeleccionado(null);
                      }}
                      disabled={productos.length === 0}
                      list="productos-list"
                    />
                    <datalist id="productos-list">
                      {productosFiltrados.map((p) => (
                        <option
                          key={p.id}
                          value={p.nombre + " (" + p.referencia + ")"}
                        />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      className="btn btn-outline-primary ms-2"
                      disabled={!busquedaProducto}
                      onClick={() => {
                        // Buscar por nombre, referencia o formato combinado
                        const prod = productos.find(
                          (p) =>
                            p.nombre.toLowerCase() ===
                              busquedaProducto.toLowerCase() ||
                            p.referencia.toLowerCase() ===
                              busquedaProducto.toLowerCase() ||
                            `${p.nombre} (${p.referencia})`.toLowerCase() ===
                              busquedaProducto.toLowerCase()
                        );
                        if (prod) handleSeleccionarProducto(prod);
                        else toast.error("Producto no encontrado");
                      }}
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>

                {/* Mostrar datos del producto seleccionado */}
                {productoSeleccionado && (
                  <div className="card mb-3 border-primary">
                    <div className="card-body">
                      <h5 className="card-title text-primary">
                        {productoSeleccionado.nombre}
                      </h5>
                      <div>
                        Referencia:{" "}
                        <strong>{productoSeleccionado.referencia}</strong>
                      </div>
                      <div>
                        Precio:{" "}
                        <strong>
                          ${productoSeleccionado.precio.toLocaleString()}
                        </strong>
                      </div>
                      <div>Descripción: {productoSeleccionado.descripcion}</div>
                      <div className="mt-2 d-flex align-items-center">
                        <label className="me-2 mb-0">Cantidad:</label>
                        <input
                          type="number"
                          min={1}
                          max={productoSeleccionado.cantidadStock}
                          value={cantidad}
                          onChange={(e) => setCantidad(Number(e.target.value))}
                          className="form-control"
                          style={{ width: 80 }}
                        />
                        <BotonAgregar
                          onClick={handleAgregarProducto}
                          texto="Agregar al recibo"
                          className="ms-3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabla de productos agregados */}
                {productosRecibo.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-3 text-success">
                      Productos en el recibo
                    </h5>
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Nombre</th>
                          <th>Referencia</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosRecibo.map((p) => (
                          <tr key={p.id}>
                            <td>{p.nombre}</td>
                            <td>{p.referencia}</td>
                            <td>${p.precio.toLocaleString()}</td>
                            <td>{p.cantidad}</td>
                            <td>${p.subtotal.toLocaleString()}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleEliminarProducto(p.id)}
                              >
                                Quitar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Botón para crear recibo */}
                {productosRecibo.length > 0 && (
                  <div className="text-end mt-3">
                    <BotonCrear
                      onClick={handleCrearRecibo}
                      texto={creando ? "Creando..." : "Crear Recibo"}
                      disabled={creando}
                    />
                  </div>
                )}
              </>
            )}
          </form>

          {/* Mostrar recibo creado */}
          {reciboCreado && (
            <div className="mt-5">
              <div className="card border-success">
                <div className="card-body">
                  <h4 className="text-success mb-3">
                    Recibo de compra creado exitosamente
                  </h4>
                  <div>
                    <strong>Número de Recibo:</strong>{" "}
                    {reciboCreado.id ? reciboCreado.id.slice(-12) : ""}
                  </div>
                  <div>
                    <strong>Cliente:</strong> {reciboCreado.cliente.nombre}{" "}
                    {reciboCreado.cliente.apellido}
                  </div>
                  <div>
                    <strong>Documento:</strong>{" "}
                    {reciboCreado.cliente.tipoDocumento}{" "}
                    {reciboCreado.cliente.numeroDocumento}
                  </div>
                  <div>
                    <strong>Fecha:</strong>{" "}
                    {new Date(reciboCreado.fecha).toLocaleString()}
                  </div>
                  <div className="mt-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Referencia</th>
                          <th>Precio Unitario</th>
                          <th>Cantidad</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reciboCreado.detalles.map((d) => (
                          <tr key={d.productoId}>
                            <td>{d.nombre}</td>
                            <td>{d.referencia}</td>
                            <td>${d.precioUnitario.toLocaleString()}</td>
                            <td>{d.cantidad}</td>
                            <td>
                              $
                              {(d.precioUnitario * d.cantidad).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-end">
                    <button
                      className="btn btn-outline-success"
                      onClick={() => descargarPDF(reciboCreado)}
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      Descargar en PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón volver al final */}
          <div className="text-end">
            <BotonVolver
              texto="← Volver al Módulo de Recibos"
              to="/ventas/recibos"
              className="btn-sm mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
