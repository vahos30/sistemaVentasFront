"use client";

import React, { useState, useEffect, useRef } from "react";
import { obtenerClientes } from "@/app/services/clienteServices";
import {
  obtenerProductos,
  actualizarProducto,
} from "@/app/services/productosService";
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
  const [aplicaIva, setAplicaIva] = useState("no");

  // 1. Agrega el estado para la forma de pago
  const [formaPago, setFormaPago] = useState(""); // Nueva línea
  const formaPagoRef = useRef(null); // Nueva línea

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
    setFormaPago(""); // Nueva línea
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
    if (!formaPago) {
      toast.error("Por favor seleccione una forma de pago.");
      formaPagoRef.current?.focus();
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
        formaPago, // Guarda la forma de pago seleccionada
      },
    ]);
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidad(1);
    setDescuentoTipo("porcentaje");
    setDescuentoValor(0);
    setFormaPago(""); // Reinicia la forma de pago
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
    // Validar que todos los productos tengan forma de pago
    const sinFormaPago = productosRecibo.find((p) => !p.formaPago);
    if (sinFormaPago) {
      toast.error("Todos los productos deben tener una forma de pago.");
      return;
    }
    setCreando(true);
    try {
      // Calcular detalles y el IVA solo si aplica
      const detalles = productosRecibo.map((p) => {
        const subtotal = calcularSubtotal(
          p.precio,
          p.cantidad,
          p.descuentoTipo,
          p.descuentoValor
        );
        return {
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          productoId: p.id,
          tipoDescuento:
            p.descuentoTipo === "porcentaje" ? "Porcentaje" : "ValorAbsoluto",
          valorDescuento: p.descuentoValor,
          subtotal,
          valorIva: aplicaIva === "si" ? (subtotal * 0.19) / 1.19 : 0, // <-- solo si aplica IVA
          formaPago: p.formaPago, // Guarda la forma de pago en cada detalle
        };
      });

      // Calcular el IVA total solo si aplica
      const valorIvaTotal =
        aplicaIva === "si"
          ? detalles.reduce((acc, d) => acc + d.valorIva, 0)
          : 0;

      // Toma la forma de pago del primer producto (puedes cambiar la lógica si quieres que sea por recibo)
      const formaPagoRecibo = productosRecibo[0]?.formaPago || "";

      // Crear el objeto recibo
      const recibo = {
        clienteId: cliente.id,
        fecha: new Date().toISOString(),
        detalles,
        valorIva: valorIvaTotal, // <-- solo si aplica IVA
        aplicaIva: aplicaIva === "si", // <-- para saber si aplica IVA
        formaPago: formaPagoRecibo, // Guarda la forma de pago en el recibo
      };

      const data = await crearRecibo(recibo);
      setReciboCreado({
        ...data,
        cliente,
        aplicaIva: aplicaIva === "si",
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
            formaPago: prod?.formaPago || d.formaPago || "", // <-- AGREGA ESTA LÍNEA
          };
        }),
      });
      toast.success("Recibo creado exitosamente");

      // Después de crear el recibo, actualiza productos con stock 0
      for (const p of productosRecibo) {
        const productoActual = productos.find((prod) => prod.id === p.id);
        const nuevoStock = productoActual.cantidadStock - p.cantidad;

        // Mostrar advertencia si el stock es igual o menor a 2
        if (nuevoStock <= 2 && nuevoStock > 0) {
          toast.info(
            ({ closeToast }) => (
              <div>
                <div>
                  <strong>Advertencia:</strong> quedan pocas unidades del
                  producto "{productoActual.nombre}"
                </div>
                <button
                  className="btn btn-sm btn-warning mt-2"
                  onClick={closeToast}
                >
                  Cerrar
                </button>
              </div>
            ),
            {
              autoClose: false,
              closeOnClick: false,
              draggable: false,
              position: "top-center",
              style: { minWidth: 320 },
            }
          );
        }

        // Inactivar si el stock es 0
        if (nuevoStock <= 0) {
          await actualizarProducto(p.id, {
            ...productoActual,
            cantidadStock: 0,
            activo: false,
          });
        } else {
          await actualizarProducto(p.id, {
            ...productoActual,
            cantidadStock: nuevoStock,
          });
        }
      }
    } catch (error) {
      toast.error("Error al crear el recibo");
    } finally {
      setCreando(false);
    }
  };

  async function descargarPDF(recibo) {
    const doc = new jsPDF();
    const numeroRecibo = recibo.id ? recibo.id.slice(-12) : "";

    // Cargar imagen logo
    const logoBase64 = await getBase64FromUrl("/LogoAYM.jpg");

    // Centrar logo
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;
    const logoHeight = 24;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 12;

    doc.addImage(logoBase64, "JPEG", logoX, logoY, logoWidth, logoHeight);

    // Centrar datos empresa debajo del logo, con espacio extra
    let infoY = logoY + logoHeight + 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("AYM ELECTRODOMESTICOS SAS", pageWidth / 2, infoY, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.text("NIT 901.696.712-0", pageWidth / 2, infoY + 7, {
      align: "center",
    });
    doc.text("CL 50 48 06", pageWidth / 2, infoY + 14, {
      align: "center",
    });
    doc.text("Tel: (57) 3007510012", pageWidth / 2, infoY + 21, {
      align: "center",
    });
    doc.text("Amagá - Colombia", pageWidth / 2, infoY + 28, {
      align: "center",
    });
    doc.text("aymelectrodomesticos.sas@gmail.com", pageWidth / 2, infoY + 35, {
      align: "center",
    });

    // Título principal debajo del bloque de datos
    let y = infoY + 45;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Recibo de Compra", 14, y);

    // Datos del recibo
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Número de Recibo:", 14, y + 10);
    doc.setFont("helvetica", "normal");
    doc.text(numeroRecibo, 60, y + 10);

    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 14, y + 18);
    doc.setFont("helvetica", "normal");
    doc.text(`${recibo.cliente.nombre} ${recibo.cliente.apellido}`, 60, y + 18);

    doc.setFont("helvetica", "bold");
    doc.text("Documento:", 14, y + 26);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${recibo.cliente.tipoDocumento} ${recibo.cliente.numeroDocumento}`,
      60,
      y + 26
    );

    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", 14, y + 34);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(recibo.fecha).toLocaleString()}`, 60, y + 34);

    // NUEVO: Forma de pago
    doc.setFont("helvetica", "bold");
    doc.text("Forma de Pago:", 14, y + 42);
    doc.setFont("helvetica", "normal");
    doc.text(recibo.formaPago || "", 60, y + 42);

    y += 50; // Ajusta el salto para los productos
    // Título productos
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

    // Cálculo de totales
    let subtotalSinIVA = 0;
    let ivaValor = 0;
    let total = 0;
    if (recibo.aplicaIva) {
      subtotalSinIVA = recibo.detalles.reduce(
        (acc, d) => acc + d.subtotal / 1.19,
        0
      );
      ivaValor = recibo.detalles.reduce(
        (acc, d) => acc + (d.subtotal * 0.19) / 1.19,
        0
      );
      total = recibo.detalles.reduce((acc, d) => acc + d.subtotal, 0);
    } else {
      total = recibo.detalles.reduce((acc, d) => acc + d.subtotal, 0);
    }

    // Mostrar totales en PDF
    let yTotales = y + 10;
    doc.setFontSize(12);
    if (recibo.aplicaIva) {
      doc.setFont("helvetica", "bold");
      doc.text("Subtotal sin IVA:", 120, yTotales);
      doc.setFont("helvetica", "normal");
      doc.text(
        `$${subtotalSinIVA.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`,
        170,
        yTotales
      );

      yTotales += 7;
      doc.setFont("helvetica", "bold");
      doc.text("IVA (19%):", 120, yTotales);
      doc.setFont("helvetica", "normal");
      doc.text(
        `$${ivaValor.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`,
        170,
        yTotales
      );

      yTotales += 7;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 120, yTotales);
    doc.setFont("helvetica", "normal");
    doc.text(`$${total.toLocaleString()}`, 170, yTotales);

    doc.save(`recibo_${numeroRecibo || Date.now()}.pdf`);
  }

  async function getBase64FromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
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

                      {/* Select de IVA aquí */}
                      <div className="mt-3 mb-2">
                        <label className="form-label fw-semibold">
                          ¿Aplicar IVA (19%)?
                        </label>
                        <select
                          className="form-select"
                          value={aplicaIva}
                          onChange={(e) => setAplicaIva(e.target.value)}
                          style={{ maxWidth: 200 }}
                        >
                          <option value="no">No</option>
                          <option value="si">Sí</option>
                        </select>
                      </div>

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
                        {/* Menú desplegable de forma de pago */}
                        <label className="ms-3 me-2 mb-0">Forma de pago:</label>
                        <select
                          ref={formaPagoRef}
                          className="form-select"
                          style={{ width: 180, minWidth: 150 }}
                          value={formaPago}
                          onChange={(e) => setFormaPago(e.target.value)}
                          required
                        >
                          <option value="">Seleccione</option>
                          <option value="Contado">Contado</option>
                          <option value="Transferencia">Transferencia</option>
                          <option value="Tarjeta de crédito">
                            Tarjeta de crédito
                          </option>
                        </select>
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
                    <div style={{ maxWidth: "100%", overflowX: "auto" }}>
                      <table
                        className="table tabla-detalle-recibo mb-0"
                        style={{ minWidth: 1100 }}
                      >
                        <thead>
                          <tr>
                            <th>Cantidad</th>
                            <th>Producto</th>
                            <th style={{ width: 300, minWidth: 200 }}>
                              Descripción
                            </th>
                            <th>Precio Unitario</th>
                            <th>Descuento</th>
                            <th>Subtotal</th>
                            <th>Forma de pago</th> {/* Nueva columna */}
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosRecibo.map((p, idx) => (
                            <tr key={p.id}>
                              <td>{p.cantidad}</td>
                              <td>{p.nombre}</td>
                              <td
                                style={{
                                  whiteSpace: "pre-line",
                                  wordBreak: "break-word",
                                  maxWidth: 300,
                                  minWidth: 200,
                                  verticalAlign: "middle",
                                  paddingTop: "0.75rem",
                                  paddingBottom: "0.75rem",
                                }}
                              >
                                {p.descripcion}
                              </td>
                              <td>${p.precio.toLocaleString()}</td>
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
                                      p.descuentoTipo === "porcentaje"
                                        ? "%"
                                        : "$"
                                    }
                                  />
                                </div>
                              </td>
                              <td>${p.subtotal.toLocaleString()}</td>
                              <td>{p.formaPago}</td>{" "}
                              {/* Muestra la forma de pago */}
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
                  <div>
                    <strong>Forma de Pago:</strong> {reciboCreado.formaPago}
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
                          <th>Forma de pago</th>
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
                            <td>{d.formaPago}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-end mt-3">
                    <button
                      className="btn btn-outline-success"
                      onClick={async () => await descargarPDF(reciboCreado)}
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      Descargar en PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumen del recibo creado */}
          {reciboCreado && (
            <div className="text-end mt-3">
              {aplicaIva === "si" && (
                <>
                  <div>
                    <strong>Subtotal sin IVA:</strong> $
                    {reciboCreado.detalles
                      .reduce((acc, d) => acc + d.subtotal / 1.19, 0)
                      .toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div>
                    <strong>IVA (19%):</strong> $
                    {reciboCreado.detalles
                      .reduce((acc, d) => acc + (d.subtotal * 0.19) / 1.19, 0)
                      .toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </>
              )}
              <div>
                <strong>Total:</strong> $
                {reciboCreado.detalles
                  .reduce((acc, d) => acc + d.subtotal, 0)
                  .toLocaleString()}
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
