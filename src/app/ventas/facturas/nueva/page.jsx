"use client";

import React, { useState, useEffect, useRef } from "react";
import { obtenerClientes } from "@/app/services/clienteServices";
import {
  obtenerProductos,
  actualizarProducto,
} from "@/app/services/productosService";
import { crearFactura } from "@/app/services/facturasService";
import BotonBuscar from "@/app/components/BotonBuscar";
import BotonAgregar from "@/app/components/BotonAgregar";
import BotonCrear from "@/app/components/BotonCrear";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

export default function CrearFacturaPage() {
  // Cliente
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cliente, setCliente] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Productos
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [descuentoTipo, setDescuentoTipo] = useState("porcentaje");
  const [descuentoValor, setDescuentoValor] = useState(0);

  // Forma de pago por producto
  const [formaPago, setFormaPago] = useState(""); // Para el menú desplegable
  const formaPagoRef = useRef(null); // Para enfocar el input si no se selecciona

  const [productosFactura, setProductosFactura] = useState([]);
  const [facturaCreada, setFacturaCreada] = useState(null);
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
    setFormaPago(""); // Reinicia la forma de pago al seleccionar producto
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

  // Agregar producto a la factura
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
    setProductosFactura((prev) => [
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
    setProductosFactura((prev) =>
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
    setProductosFactura((prev) => prev.filter((p) => p.id !== id));
  };

  // Crear factura en la API
  const handleCrearFactura = async () => {
    if (!cliente || productosFactura.length === 0) {
      toast.error("Debe seleccionar un cliente y al menos un producto.");
      return;
    }
    // Validar que todos los productos tengan forma de pago
    const sinFormaPago = productosFactura.find((p) => !p.formaPago);
    if (sinFormaPago) {
      toast.error("Todos los productos deben tener una forma de pago.");
      return;
    }
    setCreando(true);
    try {
      // Calcular detalles y el IVA solo si aplica
      const detalles = productosFactura.map((p) => {
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
          valorIva: (subtotal * 0.19) / 1.19,
        };
      });

      // Calcular el IVA total solo si aplica
      const valorIvaTotal = detalles.reduce((acc, d) => acc + d.valorIva, 0);

      // Tomar la forma de pago del primer producto (puedes cambiar la lógica si quieres que sea por factura)
      const formaPagoFactura = productosFactura[0]?.formaPago || "";

      // Crear el objeto factura
      const factura = {
        clienteId: cliente.id,
        fecha: new Date().toISOString(),
        detalles,
        valorIva: valorIvaTotal,
        aplicaIva: true,
        formaPago: formaPagoFactura, // Aquí se guarda en la factura
      };

      const data = await crearFactura(factura);
      setFacturaCreada({
        ...data,
        cliente,
        aplicaIva: true,
        formaPago: formaPagoFactura,
        detalles: data.detalles.map((d, idx) => {
          const prod = productosFactura.find((p) => p.id === d.productoId);
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
            formaPago: prod?.formaPago || formaPagoFactura,
          };
        }),
      });
      toast.success("Factura creada exitosamente");

      // Actualiza productos con stock 0
      for (const p of productosFactura) {
        const productoActual = productos.find((prod) => prod.id === p.id);
        const nuevoStock = productoActual.cantidadStock - p.cantidad;

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
      toast.error("Error al crear la factura");
    } finally {
      setCreando(false);
    }
  };

  async function getBase64FromUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function descargarPDF(factura) {
    const doc = new jsPDF();
    const numeroFactura = factura.numeroFactura || factura.NumeroFactura || "";
    const cliente = factura.cliente || {};
    const logoBase64 = await getBase64FromUrl("/LogoAYM.jpg");

    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;
    const logoHeight = 24;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 12;

    doc.addImage(logoBase64, "JPEG", logoX, logoY, logoWidth, logoHeight);

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

    let y = infoY + 45;
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text("Factura de Venta", 14, y);

    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.text("Número de Factura:", 14, y + 10);
    doc.setFont("helvetica", "normal").text(numeroFactura, 60, y + 10);
    doc.setFont("helvetica", "bold").text("Cliente:", 14, y + 18);
    doc
      .setFont("helvetica", "normal")
      .text(`${cliente.nombre || ""} ${cliente.apellido || ""}`, 60, y + 18);
    doc.setFont("helvetica", "bold").text("Documento:", 14, y + 26);
    doc
      .setFont("helvetica", "normal")
      .text(
        `${cliente.tipoDocumento || ""} ${cliente.numeroDocumento || ""}`,
        60,
        y + 26
      );
    doc.setFont("helvetica", "bold").text("Fecha:", 14, y + 34);
    doc
      .setFont("helvetica", "normal")
      .text(
        factura.fecha ? new Date(factura.fecha).toLocaleString() : "",
        60,
        y + 34
      );
    doc.setFont("helvetica", "bold").text("Forma de Pago:", 14, y + 42);
    doc
      .setFont("helvetica", "normal")
      .text(factura.formaPago || "", 60, y + 42);

    let yProd = y + 50;
    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .text("Productos", 14, yProd);
    yProd += 8;
    doc.setFontSize(12);

    factura.detalles.forEach((d, idx) => {
      doc.setFont("helvetica", "bold").text("Producto:", 14, yProd);
      doc.setFont("helvetica", "normal").text(d.nombre || "", 50, yProd);

      yProd += 7;
      doc.setFont("helvetica", "bold").text("Referencia:", 14, yProd);
      doc.setFont("helvetica", "normal").text(d.referencia || "", 50, yProd);

      yProd += 7;
      doc.setFont("helvetica", "bold").text("Descripción:", 14, yProd);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(d.descripcion || "", 140);
      doc.text(descLines, 50, yProd);
      yProd += descLines.length * 6;

      doc.setFont("helvetica", "bold").text("Precio Unitario:", 14, yProd);
      doc
        .setFont("helvetica", "normal")
        .text(`$${d.precioUnitario?.toLocaleString() || 0}`, 50, yProd);

      yProd += 7;
      doc.setFont("helvetica", "bold").text("Cantidad:", 14, yProd);
      doc.setFont("helvetica", "normal").text(String(d.cantidad), 50, yProd);

      yProd += 7;
      doc.setFont("helvetica", "bold").text("Descuento:", 14, yProd);
      doc
        .setFont("helvetica", "normal")
        .text(
          d.tipoDescuento === "ValorAbsoluto"
            ? `$${d.valorDescuento?.toLocaleString() || 0}`
            : `${d.valorDescuento || 0}%`,
          50,
          yProd
        );

      yProd += 7;
      doc.setFont("helvetica", "bold").text("Subtotal:", 14, yProd);
      doc
        .setFont("helvetica", "normal")
        .text(`$${d.subtotal?.toLocaleString() || 0}`, 50, yProd);

      yProd += 10;
      if (idx < factura.detalles.length - 1) {
        doc.setDrawColor(200).line(14, yProd, 196, yProd);
        yProd += 5;
      }
      if (yProd > 270) {
        doc.addPage();
        yProd = 20;
      }
    });

    const aplicaIva =
      factura.aplicaIva || factura.detalles.some((d) => d.valorIva > 0);
    const total = factura.detalles.reduce(
      (sum, d) => sum + (d.subtotal || 0),
      0
    );
    let subtotalSinIVA = aplicaIva
      ? factura.detalles.reduce(
          (sum, d) => sum + ((d.subtotal || 0) - (d.valorIva || 0)),
          0
        )
      : total;
    const ivaValor = aplicaIva
      ? factura.detalles.reduce((sum, d) => sum + (d.valorIva || 0), 0)
      : 0;

    let yT = yProd + 10;
    doc
      .setFontSize(12)
      .setFont("helvetica", "bold")
      .text("Subtotal sin IVA:", 120, yT);
    doc.setFont("helvetica", "normal").text(
      `$${subtotalSinIVA.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      170,
      yT
    );
    yT += 7;
    doc.setFont("helvetica", "bold").text("IVA (19%):", 120, yT);
    doc.setFont("helvetica", "normal").text(
      `$${ivaValor.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`,
      170,
      yT
    );
    yT += 7;
    doc.setFont("helvetica", "bold").text("Total:", 120, yT);
    doc
      .setFont("helvetica", "normal")
      .text(`$${total.toLocaleString()}`, 170, yT);

    doc.save(`factura_${numeroFactura || Date.now()}.pdf`);
  }

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center text-primary">
            Crear Factura de Venta
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
                          texto="Agregar a la factura"
                          className="ms-3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabla de productos agregados */}
                {productosFactura.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-3 text-success">
                      Productos en la factura
                    </h5>
                    <div style={{ maxWidth: "100%", overflowX: "auto" }}>
                      <table
                        className="table tabla-detalle-recibo mb-0"
                        style={{ minWidth: 1000 }}
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
                            <th>Forma de pago</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosFactura.map((p, idx) => (
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
                              <td>{p.formaPago}</td>
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

                {/* Subtotales y total */}
                {productosFactura.length > 0 && (
                  <div className="mt-3 text-end">
                    <div>
                      <strong>Subtotal sin IVA:</strong> $
                      {productosFactura
                        .reduce(
                          (acc, p) =>
                            acc + (p.subtotal - (p.subtotal * 0.19) / 1.19),
                          0
                        )
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    <div>
                      <strong>IVA (19%):</strong> $
                      {productosFactura
                        .reduce((acc, p) => acc + (p.subtotal * 0.19) / 1.19, 0)
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    <div>
                      <strong>Total:</strong> $
                      {productosFactura
                        .reduce((acc, p) => acc + p.subtotal, 0)
                        .toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                    </div>
                  </div>
                )}

                {/* Botón para crear factura */}
                {productosFactura.length > 0 && (
                  <div className="text-end mt-3">
                    <BotonCrear
                      onClick={handleCrearFactura}
                      texto={creando ? "Creando..." : "Crear Factura"}
                      disabled={creando}
                    />
                  </div>
                )}
              </>
            )}
          </form>

          {/* Mostrar factura creada */}
          {facturaCreada && (
            <div className="mt-5">
              <div className="card border-success">
                <div className="card-body">
                  <h4 className="text-success mb-3">
                    Factura creada exitosamente
                  </h4>
                  <div>
                    <strong>Número de Factura:</strong>{" "}
                    {facturaCreada.numeroFactura ||
                      facturaCreada.NumeroFactura ||
                      ""}
                  </div>
                  <div>
                    <strong>Cliente:</strong> {facturaCreada.cliente.nombre}{" "}
                    {facturaCreada.cliente.apellido}
                  </div>
                  <div>
                    <strong>Documento:</strong>{" "}
                    {facturaCreada.cliente.tipoDocumento}{" "}
                    {facturaCreada.cliente.numeroDocumento}
                  </div>
                  <div>
                    <strong>Fecha:</strong>{" "}
                    {new Date(facturaCreada.fecha).toLocaleString()}
                  </div>
                  <div>
                    <strong>Forma de Pago:</strong> {facturaCreada.formaPago}
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
                        {facturaCreada.detalles.map((d) => (
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
                </div>
              </div>
            </div>
          )}

          {/* Resumen de totales de la factura creada */}
          {facturaCreada && (
            <div className="mt-3 text-end">
              <div>
                <strong>Subtotal sin IVA:</strong> $
                {facturaCreada.detalles
                  .reduce(
                    (acc, d) => acc + ((d.subtotal || 0) - (d.valorIva || 0)),
                    0
                  )
                  .toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div>
                <strong>IVA (19%):</strong> $
                {facturaCreada.detalles
                  .reduce((acc, d) => acc + (d.valorIva || 0), 0)
                  .toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div>
                <strong>Total:</strong> $
                {facturaCreada.detalles
                  .reduce((acc, d) => acc + (d.subtotal || 0), 0)
                  .toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          )}

          {/* Botón volver al final */}
          <div className="text-end">
            <BotonVolver
              texto="← Volver al Módulo de Facturas"
              to="/ventas/facturas"
              className="btn-sm mt-4"
            />
          </div>

          {/* Botón para descargar PDF de la factura creada */}
          {facturaCreada && (
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-success"
                onClick={async () => await descargarPDF(facturaCreada)}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Descargar en PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
