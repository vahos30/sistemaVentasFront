"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  obtenerFacturas,
  obtenerFacturasAnuladas,
  anularFactura,
} from "@/app/services/facturasService";
import { obtenerClientes } from "@/app/services/clienteServices";
import { obtenerProductos } from "@/app/services/productosService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import { descargarFacturaPDF } from "@/app/services/factusService";

export default function TodasFacturas() {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtradas, setFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [facturasAnuladas, setFacturasAnuladas] = useState([]);
  const [modalAnular, setModalAnular] = useState({
    abierto: false,
    factura: null,
  });
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [modalNotaCredito, setModalNotaCredito] = useState({
    abierto: false,
    nota: null,
    cliente: null,
  });
  const toastMostrado = useRef(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [facturasData, clientesData, productosData] = await Promise.all([
          obtenerFacturas(),
          obtenerClientes(),
          obtenerProductos(),
        ]);
        setFacturas(facturasData);
        setClientes(clientesData);
        setProductos(productosData);
        setFiltradas(facturasData);
        if (!toastMostrado.current) {
          toast.success("Facturas cargadas exitosamente", {
            autoClose: 2000,
            icon: "🧾",
          });
          toastMostrado.current = true;
        }
      } catch (error) {
        toast.error("Error al cargar datos: " + error.message, {
          autoClose: 2000,
        });
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const cargarAnuladas = async () => {
      try {
        const anuladas = await obtenerFacturasAnuladas();
        setFacturasAnuladas(anuladas);
      } catch (e) {}
    };
    cargarAnuladas();
  }, []);

  // Filtrar facturas por nombre/apellido/documento
  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltradas(facturas);
      return;
    }
    const termino = busqueda.toLowerCase();
    setFiltradas(
      facturas.filter((factura) => {
        const cliente = clientes.find((c) => c.id === factura.clienteId);
        return (
          cliente?.nombre.toLowerCase().includes(termino) ||
          cliente?.apellido?.toLowerCase().includes(termino) ||
          cliente?.numeroDocumento?.toLowerCase().includes(termino)
        );
      })
    );
  }, [busqueda, facturas, clientes]);

  const getNombreCliente = (clienteId) => {
    const c = clientes.find((c) => c.id === clienteId);
    return c ? `${c.nombre} ${c.apellido || ""}` : "Desconocido";
  };

  const getNombreProducto = (productoId) => {
    const p = productos.find((p) => p.id === productoId);
    return p ? p.nombre : "Desconocido";
  };

  const calcularSubtotal = (precio, cantidad, tipo, valor) => {
    let subtotal = precio * cantidad;
    if (tipo === "porcentaje") {
      subtotal -= (subtotal * (valor || 0)) / 100;
    } else if (tipo === "valor") {
      subtotal -= valor || 0;
    }
    return subtotal > 0 ? subtotal : 0;
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
    const cliente = clientes.find((c) => c.id === factura.clienteId);
    const documento = cliente
      ? `${cliente.tipoDocumento || ""} ${cliente.numeroDocumento || ""}`
      : "";
    const numeroFactura = factura.numeroFactura || "";

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
    doc.text("CL 50 48 06", pageWidth / 2, infoY + 14, { align: "center" });
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
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text("Factura de Venta", 14, y);

    // Encabezado de la factura
    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.text("Número de Factura:", 14, y + 10);
    doc.setFont("helvetica", "normal").text(numeroFactura, 60, y + 10);
    doc.setFont("helvetica", "bold").text("Cliente:", 14, y + 18);
    doc
      .setFont("helvetica", "normal")
      .text(getNombreCliente(factura.clienteId), 60, y + 18);
    doc.setFont("helvetica", "bold").text("Documento:", 14, y + 26);
    doc.setFont("helvetica", "normal").text(documento, 60, y + 26);
    doc.setFont("helvetica", "bold").text("Fecha:", 14, y + 34);
    doc
      .setFont("helvetica", "normal")
      .text(new Date(factura.fecha).toLocaleString(), 60, y + 34);

    // NUEVO: Forma de pago general de la factura (si existe)
    doc.setFont("helvetica", "bold").text("Forma de Pago:", 14, y + 42);
    doc
      .setFont("helvetica", "normal")
      .text(factura.formaPago || "", 60, y + 42);

    let yProd = y + 57;
    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .text("Productos", 14, yProd);
    yProd += 8;
    doc.setFontSize(12);

    // Productos
    factura.detalles.forEach((d, idx) => {
      doc.setFont("helvetica", "bold").text("Producto:", 14, yProd);
      doc
        .setFont("helvetica", "normal")
        .text(getNombreProducto(d.productoId), 50, yProd);
      yProd += 7;
      doc.setFont("helvetica", "bold").text("Referencia:", 14, yProd);
      doc
        .setFont("helvetica", "normal")
        .text(
          productos.find((p) => p.id === d.productoId)?.referencia || "",
          50,
          yProd
        );
      yProd += 7;
      doc.setFont("helvetica", "bold").text("Descripción:", 14, yProd);
      doc.setFont("helvetica", "normal");
      const producto = productos.find((p) => p.id === d.productoId);
      const descripcion = d.descripcion || producto?.descripcion || "";
      const descLines = doc.splitTextToSize(descripcion, 140);
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
      const sub =
        d.subtotal ??
        calcularSubtotal(
          d.precioUnitario,
          d.cantidad,
          d.tipoDescuento,
          d.valorDescuento
        );
      doc
        .setFont("helvetica", "normal")
        .text(`$${sub.toLocaleString()}`, 50, yProd);
      yProd += 7;
      // NUEVO: Forma de pago por producto (si existe)
      doc.setFont("helvetica", "bold").text("Forma de Pago:", 14, yProd);
      doc
        .setFont("helvetica", "normal")
        .text(d.formaPago || factura.formaPago || "", 50, yProd);
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

    // Totales e IVA
    const aplicaIva = factura.detalles.some((d) => d.valorIva > 0);
    const total = factura.detalles.reduce((sum, d) => sum + d.subtotal, 0);
    let subtotalSinIVA = aplicaIva
      ? factura.detalles.reduce(
          (sum, d) => sum + (d.subtotal - (d.valorIva || 0)),
          0
        )
      : total;
    const ivaValor = aplicaIva
      ? factura.detalles.reduce((sum, d) => sum + (d.valorIva || 0), 0)
      : 0;

    let yT = yProd + 10;
    if (aplicaIva) {
      yT += 7;
      doc.setFont("helvetica", "bold").text("Subtotal sin IVA:", 120, yT);
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
    }
    yT += 7;
    doc.setFont("helvetica", "bold").text("Total:", 120, yT);
    doc
      .setFont("helvetica", "normal")
      .text(`$${total.toLocaleString()}`, 170, yT);

    doc.save(`factura_${numeroFactura || Date.now()}.pdf`);
  }

  async function descargarNotaCreditoPDF(nota, cliente) {
    const doc = new jsPDF();

    // Cargar imagen logo
    const logoBase64 = await getBase64FromUrl("/LogoAYM.jpg");
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 40;
    const logoHeight = 24;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 12;

    doc.addImage(logoBase64, "JPEG", logoX, logoY, logoWidth, logoHeight);

    // Datos empresa
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
    doc.text("CL 50 48 06", pageWidth / 2, infoY + 14, { align: "center" });
    doc.text("Tel: (57) 3007510012", pageWidth / 2, infoY + 21, {
      align: "center",
    });
    doc.text("Amagá - Colombia", pageWidth / 2, infoY + 28, {
      align: "center",
    });
    doc.text("aymelectrodomesticos.sas@gmail.com", pageWidth / 2, infoY + 35, {
      align: "center",
    });

    // Título
    let y = infoY + 45;
    doc.setFontSize(18).setFont("helvetica", "bold");
    doc.text("Nota Crédito", 14, y);

    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.text("Número Nota Crédito:", 14, y + 10);
    doc.setFont("helvetica", "normal").text(nota.numeroNotaCredito, 70, y + 10);

    doc.setFont("helvetica", "bold").text("Factura Anulada:", 14, y + 18);
    doc.setFont("helvetica", "normal").text(nota.numeroFactura, 70, y + 18);

    doc.setFont("helvetica", "bold").text("Cliente:", 14, y + 26);
    doc
      .setFont("helvetica", "normal")
      .text(
        cliente ? `${cliente.nombre} ${cliente.apellido || ""}` : "Desconocido",
        70,
        y + 26
      );

    doc.setFont("helvetica", "bold").text("Motivo de Anulación:", 14, y + 34);
    doc.setFont("helvetica", "normal").text(nota.motivoAnulacion, 70, y + 34);

    doc.setFont("helvetica", "bold").text("Fecha de Anulación:", 14, y + 42);
    doc
      .setFont("helvetica", "normal")
      .text(new Date(nota.fechaAnulacion).toLocaleString(), 70, y + 42);

    doc.setFont("helvetica", "bold").text("Total:", 14, y + 50);
    doc
      .setFont("helvetica", "normal")
      .text(`$${nota.total.toLocaleString()}`, 70, y + 50);

    doc.save(`nota_credito_${nota.numeroNotaCredito || Date.now()}.pdf`);
  }

  function estaAnulada(numeroFactura) {
    return facturasAnuladas.some((f) => f.numeroFactura === numeroFactura);
  }

  async function handleAnularFactura() {
    if (!motivoAnulacion.trim()) {
      toast.error("Debe escribir el motivo de anulación.");
      return;
    }
    try {
      const infoAnulada = await anularFactura(
        modalAnular.factura.id,
        motivoAnulacion
      );
      setModalAnular({ abierto: false, factura: null });
      setMotivoAnulacion("");
      const anuladas = await obtenerFacturasAnuladas();
      setFacturasAnuladas(anuladas);

      if (infoAnulada) {
        toast.info(
          <div>
            <div>
              <strong>Factura anulada:</strong> {infoAnulada.numeroFactura}
            </div>
            <div>
              <strong>Nota crédito:</strong> {infoAnulada.numeroNotaCredito}
            </div>
            <div>
              <strong>Motivo:</strong> {infoAnulada.motivoAnulacion}
            </div>
            <div>
              <strong>Fecha:</strong>{" "}
              {new Date(infoAnulada.fechaAnulacion).toLocaleString()}
            </div>
            <div>
              <strong>Total:</strong> ${infoAnulada.total.toLocaleString()}
            </div>
          </div>,
          { autoClose: false }
        );
      } else {
        toast.success("Factura anulada correctamente.");
      }
    } catch (e) {
      toast.error("Error al anular la factura");
    }
  }

  function confirmarAnulacion(factura) {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <div>¿Está seguro que desea anular esta factura?</div>
          <div className="mt-2 d-flex justify-content-end gap-2">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                closeToast();
                setModalAnular({ abierto: true, factura });
              }}
            >
              Sí
            </button>
            <button className="btn btn-secondary btn-sm" onClick={closeToast}>
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  }

  // Busca la información de la nota crédito y el cliente
  function verNotaCredito(factura) {
    const nota = facturasAnuladas.find(
      (f) => f.numeroFactura === factura.numeroFactura
    );
    const cliente = clientes.find((c) => c.id === factura.clienteId);
    setModalNotaCredito({ abierto: true, nota, cliente });
  }

  async function handleDescargarPDF(numeroFactura) {
    try {
      const blob = await descargarFacturaPDF(numeroFactura);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factura_${numeroFactura}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error al descargar el PDF.");
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Facturas</h2>
        <BotonVolver
          texto="← Volver al Módulo de Facturas"
          to="/ventas/facturas"
        />
      </div>

      <div className="input-group mb-4 shadow-sm">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre o cédula del cliente..."
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
          <p className="mt-2 text-muted">Cargando facturas...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow">
            <thead className="table-dark">
              <tr>
                <th># Factura</th>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Fecha</th>
                <th>Detalles de la Factura</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length > 0 ? (
                filtradas.map((factura) => (
                  <tr key={factura.id}>
                    <td>{factura.numeroFactura}</td>
                    <td>{getNombreCliente(factura.clienteId)}</td>
                    <td>
                      {(() => {
                        const cliente = clientes.find(
                          (c) => c.id === factura.clienteId
                        );
                        return cliente
                          ? `${cliente.tipoDocumento} ${cliente.numeroDocumento}`
                          : "";
                      })()}
                    </td>
                    <td>{new Date(factura.fecha).toLocaleString()}</td>
                    <td>
                      <div>
                        <div
                          className="fw-semibold mb-1 text-primary"
                          style={{ fontSize: "0.98rem" }}
                        >
                          Detalles de la factura
                        </div>
                        <div className="table-responsive">
                          <table className="table tabla-detalle-recibo mb-0">
                            <thead>
                              <tr>
                                <th>Cantidad</th>
                                <th>Producto</th>
                                <th>Precio Unitario</th>
                                <th>Descuento</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {factura.detalles.map((det) => (
                                <tr key={det.id || det.productoId}>
                                  <td>{det.cantidad}</td>
                                  <td>{getNombreProducto(det.productoId)}</td>
                                  <td>
                                    ${det.precioUnitario?.toLocaleString() || 0}
                                  </td>
                                  <td>
                                    {det.tipoDescuento === "ValorAbsoluto"
                                      ? `$${
                                          det.valorDescuento?.toLocaleString() ||
                                          0
                                        }`
                                      : `${det.valorDescuento || 0}%`}
                                  </td>
                                  <td>
                                    ${det.subtotal?.toLocaleString() || 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              handleDescargarPDF(factura.numeroFactura)
                            }
                          >
                            Descargar PDF
                          </button>
                        </div>
                        <div className="mt-2 text-end">
                          {estaAnulada(factura.numeroFactura) && (
                            <div>
                              <span className="text-danger fw-bold">
                                FACTURA ANULADA
                              </span>
                            </div>
                          )}
                          <div>
                            <strong>Subtotal sin IVA:</strong> $
                            {factura.detalles
                              .reduce(
                                (acc, d) =>
                                  acc + (d.subtotal - (d.valorIva || 0)),
                                0
                              )
                              .toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                          </div>
                          <div>
                            <strong>IVA (19%):</strong> $
                            {factura.detalles
                              .reduce((acc, d) => acc + (d.valorIva || 0), 0)
                              .toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                          </div>
                          <div>
                            <strong>Total:</strong> $
                            {factura.detalles
                              .reduce((sum, d) => sum + d.subtotal, 0)
                              .toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ verticalAlign: "middle" }}>
                      {estaAnulada(factura.numeroFactura) ? (
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => verNotaCredito(factura)}
                        >
                          Ver Nota Crédito
                        </button>
                      ) : (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => confirmarAnulacion(factura)}
                        >
                          Anular Factura
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    {busqueda
                      ? `No se encontraron facturas para "${busqueda}"`
                      : "No hay facturas registradas"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-end text-muted small mt-2">
            Mostrando {filtradas.length}{" "}
            {filtradas.length === 1 ? "factura" : "facturas"}
          </div>
        </div>
      )}

      {modalAnular.abierto && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "#0008" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Anular Factura</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setModalAnular({ abierto: false, factura: null })
                  }
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">
                  Por favor escriba el motivo de anulación:
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setModalAnular({ abierto: false, factura: null })
                  }
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleAnularFactura}
                >
                  Anular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nota Crédito */}
      {modalNotaCredito.abierto && modalNotaCredito.nota && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "#0008" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nota Crédito</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setModalNotaCredito({
                      abierto: false,
                      nota: null,
                      cliente: null,
                    })
                  }
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <strong>Cliente:</strong>{" "}
                  {modalNotaCredito.cliente
                    ? `${modalNotaCredito.cliente.nombre} ${
                        modalNotaCredito.cliente.apellido || ""
                      }`
                    : "Desconocido"}
                </div>
                <div className="mb-2">
                  <strong>Número de Factura Anulada:</strong>{" "}
                  {modalNotaCredito.nota.numeroFactura}
                </div>
                <div className="mb-2">
                  <strong>Número Nota Crédito:</strong>{" "}
                  {modalNotaCredito.nota.numeroNotaCredito}
                </div>
                <div className="mb-2">
                  <strong>Motivo de Anulación:</strong>{" "}
                  {modalNotaCredito.nota.motivoAnulacion}
                </div>
                <div className="mb-2">
                  <strong>Fecha de Anulación:</strong>{" "}
                  {new Date(
                    modalNotaCredito.nota.fechaAnulacion
                  ).toLocaleString()}
                </div>
                <div className="mb-2">
                  <strong>Total:</strong> $
                  {modalNotaCredito.nota.total.toLocaleString()}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() =>
                    descargarNotaCreditoPDF(
                      modalNotaCredito.nota,
                      modalNotaCredito.cliente
                    )
                  }
                >
                  Descargar en PDF
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setModalNotaCredito({
                      abierto: false,
                      nota: null,
                      cliente: null,
                    })
                  }
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
