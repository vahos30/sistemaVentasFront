"use client";

import React, { useEffect, useState, useRef } from "react";
import { obtenerRecibos } from "@/app/services/recibosService";
import { obtenerClientes } from "@/app/services/clienteServices";
import { obtenerProductos } from "@/app/services/productosService";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

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

  // Buscar por nombre de cliente o cédula
  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltrados(recibos);
      return;
    }
    const termino = busqueda.toLowerCase();
    const resultados = recibos.filter((recibo) => {
      const cliente = clientes.find((c) => c.id === recibo.clienteId);
      return (
        (cliente?.nombre && cliente.nombre.toLowerCase().includes(termino)) ||
        (cliente?.apellido &&
          cliente.apellido.toLowerCase().includes(termino)) ||
        (cliente?.numeroDocumento &&
          cliente.numeroDocumento.toLowerCase().includes(termino))
      );
    });
    setFiltrados(resultados);
  }, [busqueda, recibos, clientes]);

  // Helpers para mostrar nombres
  const getNombreCliente = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente
      ? `${cliente.nombre} ${cliente.apellido || ""}`
      : "Desconocido";
  };

  const getNombreProducto = (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    return producto ? producto.nombre : "Desconocido";
  };

  // Calcula el subtotal con descuento
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

  function descargarPDF(recibo) {
    const doc = new jsPDF();
    const cliente = clientes.find((c) => c.id === recibo.clienteId);
    const documento = cliente
      ? `${cliente.tipoDocumento || ""} ${cliente.numeroDocumento || ""}`
      : "";
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
    doc.text(getNombreCliente(recibo.clienteId), 60, 36);

    doc.setFont("helvetica", "bold");
    doc.text("Documento:", 14, 44);
    doc.setFont("helvetica", "normal");
    doc.text(documento, 60, 44);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date(recibo.fecha).toLocaleString()}`, 60, 52);

    doc.setFont("helvetica", "bold");
    doc.text("Total:", 14, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`$${recibo.total.toLocaleString()}`, 60, 60);

    // Título productos
    let y = 75;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Productos", 14, y);

    y += 8;
    doc.setFontSize(12);

    recibo.detalles.forEach((d, idx) => {
      // Producto
      doc.setFont("helvetica", "bold");
      doc.text("Producto:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(getNombreProducto(d.productoId), 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Referencia:", 14, y);
      doc.setFont("helvetica", "normal");
      const producto = productos.find((p) => p.id === d.productoId);
      doc.text(producto?.referencia || "", 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Descripción:", 14, y);
      doc.setFont("helvetica", "normal");
      const descripcion = d.descripcion || producto?.descripcion || "";
      const descLines = doc.splitTextToSize(descripcion, 140);
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
        d.tipoDescuento === "ValorAbsoluto"
          ? `$${d.valorDescuento?.toLocaleString() || 0}`
          : `${d.valorDescuento || 0}%`;
      doc.text(descuentoTexto, 50, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.text("Subtotal:", 14, y);
      doc.setFont("helvetica", "normal");
      // Calcula el subtotal con descuento si no viene
      let subtotal = d.subtotal;
      if (subtotal === undefined) {
        subtotal = calcularSubtotal(
          d.precioUnitario,
          d.cantidad,
          d.descuentoTipo,
          d.descuentoValor
        );
      }
      doc.text(`$${subtotal.toLocaleString()}`, 50, y);

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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Recibos</h2>
        <BotonVolver
          texto="← Volver al Módulo de Recibos"
          to="/ventas/recibos"
        />
      </div>

      {/* Barra de búsqueda */}
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
                    ? `${cliente.tipoDocumento || ""} ${
                        cliente.numeroDocumento || ""
                      }`
                    : "";
                  return (
                    <tr key={recibo.id}>
                      <td>{recibo.id.slice(-12)}</td>
                      <td>
                        {cliente
                          ? `${cliente.nombre} ${cliente.apellido || ""}`
                          : "Desconocido"}
                      </td>
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
                                {recibo.detalles.map((detalle) => (
                                  <tr key={detalle.id || detalle.productoId}>
                                    <td>{detalle.cantidad}</td>
                                    <td>
                                      {getNombreProducto(detalle.productoId)}
                                    </td>
                                    <td>
                                      ${detalle.precioUnitario.toLocaleString()}
                                    </td>
                                    <td>
                                      {detalle.tipoDescuento === "ValorAbsoluto"
                                        ? `$${
                                            detalle.valorDescuento?.toLocaleString() ||
                                            0
                                          }`
                                        : `${detalle.valorDescuento || 0}%`}
                                    </td>
                                    <td>
                                      ${detalle.subtotal.toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <button
                            className="btn btn-outline-accent btn-sm mt-2"
                            onClick={() => descargarPDF(recibo)}
                          >
                            Descargar PDF
                          </button>
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
