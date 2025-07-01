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

  function descargarPDF(recibo) {
    const doc = new jsPDF();
    const cliente = clientes.find((c) => c.id === recibo.clienteId);
    const documento = cliente
      ? `${cliente.tipoDocumento || ""} ${cliente.numeroDocumento || ""}`
      : "";

    doc.setFontSize(16);
    doc.text("Recibo de Pago", 14, 18);

    doc.setFontSize(12);
    doc.text(`Número de Recibo: ${recibo.id.slice(-12)}`, 14, 30);
    doc.text(`Cliente: ${getNombreCliente(recibo.clienteId)}`, 14, 38);
    doc.text(`Documento: ${documento}`, 14, 46);
    doc.text(`Fecha: ${new Date(recibo.fecha).toLocaleString()}`, 14, 54);
    doc.text(`Total: $${recibo.total.toLocaleString()}`, 14, 62);

    doc.setFontSize(13);
    doc.text("Detalles:", 14, 74);

    // Tabla de detalles
    let y = 82;
    doc.setFontSize(11);
    doc.text("Cantidad", 14, y);
    doc.text("Producto", 40, y);
    doc.text("Precio Unit.", 100, y);
    doc.text("Subtotal", 150, y);

    y += 7;
    recibo.detalles.forEach((detalle) => {
      doc.text(String(detalle.cantidad), 14, y);
      doc.text(getNombreProducto(detalle.productoId), 40, y);
      doc.text(`$${detalle.precioUnitario.toLocaleString()}`, 100, y);
      doc.text(`$${detalle.subtotal.toLocaleString()}`, 150, y);
      y += 7;
    });

    doc.save(`recibo_${recibo.id.slice(-12)}.pdf`);
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
                    ? `${cliente.tipoDocumento || ""} ${cliente.numeroDocumento || ""}`
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
                          <table className="table tabla-detalle-recibo mb-0">
                            <thead>
                              <tr>
                                <th>Cantidad</th>
                                <th>Producto</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recibo.detalles.map((detalle) => (
                                <tr key={detalle.id}>
                                  <td>{detalle.cantidad}</td>
                                  <td>
                                    {getNombreProducto(detalle.productoId)}
                                  </td>
                                  <td>
                                    ${detalle.precioUnitario.toLocaleString()}
                                  </td>
                                  <td>${detalle.subtotal.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
