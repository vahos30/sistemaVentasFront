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
  const [descuentoTipo, setDescuentoTipo] = useState("porcentaje"); // "porcentaje" o "valor"
  const [descuentoValor, setDescuentoValor] = useState(0);
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
    setDescuentoTipo("porcentaje");
    setDescuentoValor(0);
  };

  // Calcular subtotal con descuento
  const calcularSubtotal = (
    precio,
    cantidad,
    descuentoTipo,
    descuentoValor
  ) => {
    let subtotal = precio * cantidad;
    if (descuentoTipo === "porcentaje") {
      subtotal = subtotal - (subtotal * (descuentoValor || 0)) / 100;
    } else if (descuentoTipo === "valor") {
      subtotal = subtotal - (descuentoValor || 0);
    }
    return subtotal > 0 ? subtotal : 0;
  };

  // Agregar producto al recibo
  const handleAgregarProducto = () => {
    if (!productoSeleccionado) return;
    if (cantidad < 1 || cantidad > productoSeleccionado.cantidadStock) {
      toast.error("Cantidad inválida, verifique la cantidad en stock.");
      return;
    }
    if (
      descuentoTipo === "porcentaje" &&
      (descuentoValor < 0 || descuentoValor > 100)
    ) {
      toast.error("El descuento en porcentaje debe estar entre 0 y 100.");
      return;
    }
    if (descuentoTipo === "valor" && descuentoValor < 0) {
      toast.error("El descuento en valor no puede ser negativo.");
      return;
    }
    const subtotal = calcularSubtotal(
      productoSeleccionado.precio,
      cantidad,
      descuentoTipo,
      descuentoValor
    );
    setProductosRecibo((prev) => [
      ...prev,
      {
        ...productoSeleccionado,
        cantidad,
        descuentoTipo,
        descuentoValor,
        subtotal,
        descripcion: productoSeleccionado.descripcion,
      },
    ]);
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidad(1);
    setDescuentoTipo("porcentaje");
    setDescuentoValor(0);
  };

  // Editar descuento de un producto ya agregado
  const handleEditarDescuento = (idx, tipo, valor) => {
    setProductosRecibo((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              descuentoTipo: tipo,
              descuentoValor: valor,
              subtotal: calcularSubtotal(p.precio, p.cantidad, tipo, valor),
            }
          : p
      )
    );
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
          tipoDescuento:
            p.descuentoTipo === "porcentaje" ? "Porcentaje" : "ValorAbsoluto",
          valorDescuento: p.descuentoValor,
        })),
      };
      const data = await crearRecibo(recibo);
      setReciboCreado({
        ...data,
        cliente,
        detalles: data.detalles.map((d) => {
          const prod = productosRecibo.find((p) => p.id === d.productoId);
          return {
            ...d,
            ...productos.find((p) => p.id === d.productoId),
            descuentoTipo: prod?.descuentoTipo || "porcentaje",
            descuentoValor: prod?.descuentoValor || 0,
            subtotal: calcularSubtotal(
              d.precioUnitario,
              d.cantidad,
              prod?.descuentoTipo || "porcentaje",
              prod?.descuentoValor || 0
            ),
          };
        }),
      });
      toast.success("Recibo creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el recibo");
    } finally {
      setCreando(false);
    }
  };

  function descargarPDF(recibo) {
    const doc = new jsPDF();
    const numeroRecibo = recibo.id ? recibo.id.slice(-12) : "";

    // Título principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Recibo de Compra", 14, 18);

    // Datos del recibo
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Número de Recibo:", 14, 28);
    doc.setFont("helvetica", "normal");
    doc.text(numeroRecibo, 60, 28);

    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 14, 36);
    doc.setFont("helvetica", "normal");
    doc.text(`${recibo.cliente.nombre} ${recibo.cliente.apellido}`, 60, 36);

    doc.setFont("helvetica", "bold");
    doc.text("Documento:", 14, 44);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${recibo.cliente.tipoDocumento} ${recibo.cliente.numeroDocumento}`,
      60,
      44
    );

    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(recibo.fecha).toLocaleString()}`, 60, 52);

    // Título productos
    let y = 68;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Productos", 14, y);

    y += 8;
    doc.setFontSize(12);

    recibo.detalles.forEach((d, idx) => {
      doc.setFont("helvetica", "bold");
      doc.text("Producto:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(d.nombre, 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Referencia:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(d.referencia, 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Descripción:", 14, y);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(d.descripcion || "", 140);
      doc.text(descLines, 50, y);
      y += descLines.length * 6;

      doc.setFont("helvetica", "bold");
      doc.text("Precio Unitario:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(`$${d.precioUnitario.toLocaleString()}`, 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Cantidad:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(d.cantidad), 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Descuento:", 14, y);
      doc.setFont("helvetica", "normal");
      let descuentoTexto =
        d.descuentoTipo === "valor"
          ? `$${d.descuentoValor?.toLocaleString() || 0}`
          : `${d.descuentoValor || 0}%`;
      doc.text(descuentoTexto, 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Subtotal:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(`$${d.subtotal.toLocaleString()}`, 50, y);

      y += 10;
      // Línea separadora entre productos
      if (idx < recibo.detalles.length - 1) {
        doc.setDrawColor(200);
        doc.line(14, y, 196, y);
        y += 5;
      }

      // Salto de página si es necesario
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`recibo_${numeroRecibo || Date.now()}.pdf`);
  }

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
                      <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
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
                        <label className="ms-3 me-2 mb-0">Descuento:</label>
                        <select
                          className="form-select"
                          style={{ width: 180, minWidth: 150 }}
                          value={descuentoTipo}
                          onChange={(e) => setDescuentoTipo(e.target.value)}
                        >
                          <option value="porcentaje">Porcentaje (%)</option>
                          <option value="valor">Valor ($)</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          max={
                            descuentoTipo === "porcentaje"
                              ? 100
                              : productoSeleccionado.precio * cantidad
                          }
                          value={descuentoValor}
                          onChange={(e) =>
                            setDescuentoValor(Number(e.target.value))
                          }
                          className="form-control"
                          style={{ width: 100, minWidth: 80 }}
                          placeholder={
                            descuentoTipo === "porcentaje" ? "%" : "$"
                          }
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
                  <div className="mt-4 table-responsive">
                    <h5 className="mb-3 text-success">
                      Productos en el recibo
                    </h5>
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Nombre</th>
                          <th>Referencia</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th>Descripción</th>
                          <th>Descuento</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosRecibo.map((p, idx) => (
                          <tr key={p.id}>
                            <td>{p.nombre}</td>
                            <td>{p.referencia}</td>
                            <td>${p.precio.toLocaleString()}</td>
                            <td>{p.cantidad}</td>
                            <td>{p.descripcion}</td>
                            <td>
                              <div className="d-flex flex-column gap-1">
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: 130, minWidth: 110 }}
                                  value={p.descuentoTipo}
                                  onChange={(e) =>
                                    handleEditarDescuento(
                                      idx,
                                      e.target.value,
                                      p.descuentoValor
                                    )
                                  }
                                >
                                  <option value="porcentaje">
                                    Porcentaje (%)
                                  </option>
                                  <option value="valor">Valor ($)</option>
                                </select>
                                <input
                                  type="number"
                                  min={0}
                                  max={
                                    p.descuentoTipo === "porcentaje"
                                      ? 100
                                      : p.precio * p.cantidad
                                  }
                                  value={p.descuentoValor}
                                  onChange={(e) =>
                                    handleEditarDescuento(
                                      idx,
                                      p.descuentoTipo,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="form-control form-control-sm"
                                  style={{ width: 100, minWidth: 80 }}
                                  placeholder={
                                    p.descuentoTipo === "porcentaje" ? "%" : "$"
                                  }
                                />
                              </div>
                            </td>
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
                  <div className="mt-3 table-responsive">
                    <table className="table table-bordered align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Referencia</th>
                          <th>Descripción</th>
                          <th>Precio Unitario</th>
                          <th>Cantidad</th>
                          <th>Descuento</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reciboCreado.detalles.map((d) => (
                          <tr key={d.productoId}>
                            <td>{d.nombre}</td>
                            <td>{d.referencia}</td>
                            <td style={{ minWidth: 120 }}>{d.descripcion}</td>
                            <td>${d.precioUnitario.toLocaleString()}</td>
                            <td>{d.cantidad}</td>
                            <td>
                              {d.tipoDescuento === "ValorAbsoluto"
                                ? `$${d.valorDescuento?.toLocaleString() || 0}`
                                : `${d.valorDescuento || 0}%`}
                            </td>
                            <td>${d.subtotal.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-end mt-3">
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
