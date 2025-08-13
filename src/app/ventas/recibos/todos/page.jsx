"use client";

import React, { useEffect, useState, useRef } from "react";
import { obtenerRecibos, eliminarRecibo } from "@/app/services/recibosService";
import { obtenerClientes } from "@/app/services/clienteServices";
import { obtenerProductos } from "@/app/services/productosService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";

// Confirmación de borrado con callback
const mostrarToastConfirmacion = (onConfirm) => {
  toast.info(
    ({ closeToast }) => (
      <div>
        <div className="fw-semibold mb-2">
          ¿Está seguro de eliminar el Recibo de compra?
        </div>
        <div className="mb-2 text-danger small">
          Esta acción no se podrá deshacer.
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-sm btn-secondary" onClick={closeToast}>
            No
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={async () => {
              await onConfirm();
              closeToast();
            }}
          >
            Sí, eliminar
          </button>
        </div>
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
};

export default function TodosRecibos() {
  const [recibos, setRecibos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const toastMostrado = useRef(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [recibosData, clientesData, productosData] = await Promise.all([
          obtenerRecibos(),
          obtenerClientes(),
          obtenerProductos(),
        ]);
        setRecibos(recibosData);
        setClientes(clientesData);
        setProductos(productosData);
        setFiltrados(recibosData);
        if (!toastMostrado.current) {
          toast.success("Recibos cargados exitosamente", {
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

  // Filtrar recibos por nombre/apellido/documento
  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltrados(recibos);
      return;
    }
    const termino = busqueda.toLowerCase();
    setFiltrados(
      recibos.filter((recibo) => {
        const cliente = clientes.find((c) => c.id === recibo.clienteId);
        return (
          cliente?.nombre.toLowerCase().includes(termino) ||
          cliente?.apellido?.toLowerCase().includes(termino) ||
          cliente?.numeroDocumento?.toLowerCase().includes(termino)
        );
      })
    );
  }, [busqueda, recibos, clientes]);

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

  async function descargarPDF(recibo) {
    const doc = new jsPDF();
    const cliente = clientes.find((c) => c.id === recibo.clienteId);
    const documento = cliente
      ? `${cliente.tipoDocumento || ""} ${cliente.numeroDocumento || ""}`
      : "";
    const numeroRecibo = recibo.id.slice(-12);

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
    doc.text("Recibo de Compra", 14, y);

    // Encabezado del recibo
    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.text("Número de Recibo:", 14, y + 10);
    doc.setFont("helvetica", "normal").text(numeroRecibo, 60, y + 10);
    doc.setFont("helvetica", "bold").text("Cliente:", 14, y + 18);
    doc
      .setFont("helvetica", "normal")
      .text(getNombreCliente(recibo.clienteId), 60, y + 18);
    doc.setFont("helvetica", "bold").text("Documento:", 14, y + 26);
    doc.setFont("helvetica", "normal").text(documento, 60, y + 26);
    doc.setFont("helvetica", "bold").text("Fecha:", 14, y + 34);
    doc
      .setFont("helvetica", "normal")
      .text(new Date(recibo.fecha).toLocaleString(), 60, y + 34);
    // NUEVO: Forma de pago general del recibo (si existe)
    doc.setFont("helvetica", "bold").text("Forma de Pago:", 14, y + 42);
    doc.setFont("helvetica", "normal").text(recibo.formaPago || "", 60, y + 42);

    let yProd = y + 57;
    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .text("Productos", 14, yProd);
    yProd += 8;
    doc.setFontSize(12);

    // Productos
    recibo.detalles.forEach((d, idx) => {
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
        .text(`$${d.precioUnitario.toLocaleString()}`, 50, yProd);
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
        .text(d.formaPago || recibo.formaPago || "", 50, yProd);
      yProd += 10;
      if (idx < recibo.detalles.length - 1) {
        doc.setDrawColor(200).line(14, yProd, 196, yProd);
        yProd += 5;
      }
      if (yProd > 270) {
        doc.addPage();
        yProd = 20;
      }
    });

    // Totales e IVA
    const aplicaIva = recibo.detalles.some((d) => d.valorIva > 0);
    const total = recibo.detalles.reduce((sum, d) => sum + d.subtotal, 0);
    let subtotalSinIVA = aplicaIva
      ? recibo.detalles.reduce((sum, d) => sum + (d.subtotal - d.valorIva), 0)
      : total;
    const ivaValor = aplicaIva
      ? recibo.detalles.reduce((sum, d) => sum + d.valorIva, 0)
      : 0;

    let yT = yProd + 10;
    doc
      .setFontSize(12)
      .setFont("helvetica", "bold")
      .text("Aplica IVA:", 14, yT);
    doc.setFont("helvetica", "normal").text(aplicaIva ? "Sí" : "No", 60, yT);
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

    doc.save(`recibo_${numeroRecibo || Date.now()}.pdf`);
  }

  const handleEliminarRecibo = async (id) => {
    try {
      await eliminarRecibo(id);
      setRecibos((r) => r.filter((x) => x.id !== id));
      setFiltrados((f) => f.filter((x) => x.id !== id));
      toast.success("Recibo eliminado correctamente");
    } catch {
      toast.error("Error al eliminar el recibo");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Recibos</h2>
        <BotonVolver
          texto="← Volver al Módulo de Recibos"
          to="/ventas/recibos"
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
          <p className="mt-2 text-muted">Cargando recibos...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover shadow">
            <thead className="table-dark">
              <tr>
                <th># Recibo</th>
                <th>Cliente</th>
                <th>Documento</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Detalles del Recibo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? (
                filtrados.map((recibo) => {
                  const cliente = clientes.find(
                    (c) => c.id === recibo.clienteId
                  );
                  const documento = cliente
                    ? `${cliente.tipoDocumento} ${cliente.numeroDocumento}`
                    : "";
                  // Nuevo cálculo aquí:
                  const aplicaIva = recibo.detalles.some((d) => d.valorIva > 0);
                  const total = recibo.detalles.reduce(
                    (sum, d) => sum + d.subtotal,
                    0
                  );

                  return (
                    <tr key={recibo.id}>
                      <td>{recibo.id.slice(-12)}</td>
                      <td>{getNombreCliente(recibo.clienteId)}</td>
                      <td>{documento}</td>
                      <td>{new Date(recibo.fecha).toLocaleString()}</td>
                      <td>${recibo.total.toLocaleString()}</td>
                      <td>
                        <div>
                          <div
                            className="fw-semibold mb-1 text-primary"
                            style={{ fontSize: "0.98rem" }}
                          >
                            Detalles del recibo
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
                                {recibo.detalles.map((det) => (
                                  <tr key={det.id || det.productoId}>
                                    <td>{det.cantidad}</td>
                                    <td>{getNombreProducto(det.productoId)}</td>
                                    <td>
                                      ${det.precioUnitario.toLocaleString()}
                                    </td>
                                    <td>
                                      {det.tipoDescuento === "ValorAbsoluto"
                                        ? `$${
                                            det.valorDescuento?.toLocaleString() ||
                                            0
                                          }`
                                        : `${det.valorDescuento || 0}%`}
                                    </td>
                                    <td>${det.subtotal.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-2">
                            <button
                              className="btn btn-outline-accent btn-sm"
                              onClick={() => descargarPDF(recibo)}
                            >
                              Descargar PDF
                            </button>
                            <button
                              className="btn btn-danger btn-sm ms-2"
                              onClick={() =>
                                mostrarToastConfirmacion(() =>
                                  handleEliminarRecibo(recibo.id)
                                )
                              }
                            >
                              Anular recibo
                            </button>
                          </div>
                          <div className="mt-2 text-end">
                            <div>
                              <strong>Aplica IVA:</strong>{" "}
                              {aplicaIva ? "Sí" : "No"}
                            </div>
                            {aplicaIva && (
                              <>
                                <div>
                                  <strong>Subtotal sin IVA:</strong> $
                                  {recibo.detalles
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
                                  {recibo.detalles
                                    .reduce(
                                      (acc, d) => acc + (d.valorIva || 0),
                                      0
                                    )
                                    .toLocaleString(undefined, {
                                      maximumFractionDigits: 2,
                                    })}
                                </div>
                              </>
                            )}
                            <div>
                              <strong>Total:</strong> ${total.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    {busqueda
                      ? `No se encontraron recibos para "${busqueda}"`
                      : "No hay recibos registrados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="text-end text-muted small mt-2">
            Mostrando {filtrados.length}{" "}
            {filtrados.length === 1 ? "recibo" : "recibos"}
          </div>
        </div>
      )}
    </div>
  );
}
