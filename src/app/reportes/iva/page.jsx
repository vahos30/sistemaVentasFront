"use client";

import React, { useState, useEffect } from "react";
import { obtenerVentasPorFecha } from "@/app/services/reportesService";
import { obtenerClientes } from "@/app/services/clienteServices";
import BotonVolver from "@/app/components/BotonVolver";
import BotonDescargarPDF from "@/app/components/BotonDescargarPDF";
import { toast } from "react-toastify";

export default function InformeIvaPage() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
      } catch {
        toast.error("Error al cargar los clientes");
      }
    };
    cargarClientes();
  }, []);

  const generarInforme = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Debe seleccionar ambas fechas.");
      return;
    }

    // Verificar si la fecha de inicio es mayor que la fecha final
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error("La fecha inicial no puede ser superior a la fecha final.");
      return;
    }

    setCargando(true);
    setVentas([]);
    try {
      const fechaInicioCompleta = fechaInicio + "T00:00:00";
      const fechaFinCompleta = fechaFin + "T23:59:59";
      const data = await obtenerVentasPorFecha(
        fechaInicioCompleta,
        fechaFinCompleta
      );

      // Filtrar las facturas anuladas y mapear los datos necesarios
      const facturas = (data.facturas || [])
        .filter((f) => !f.anulada)
        .map((f) => {
          const valorIva = (f.detalles || []).reduce(
            (sum, d) => sum + (d.valorIva || 0),
            0
          );
          return {
            numeroFactura: f.numeroFactura || f.id.slice(-8),
            clienteNombre: obtenerNombreCompleto(f.clienteId),
            fecha: f.fecha,
            valorTotal: f.total,
            valorIva, // Calculado a partir de los detalles
          };
        });

      setVentas(facturas);

      if (facturas.length === 0) {
        toast.info("No hay facturas en el rango de fechas seleccionado.");
      }
    } catch {
      toast.error("Error al consultar las facturas por fecha.");
    } finally {
      setCargando(false);
    }
  };

  const obtenerNombreCompleto = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellido || ""}`.trim() : "-";
  };

  const totalIva = ventas.reduce((sum, venta) => sum + venta.valorIva, 0);

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Informe de IVA</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label fw-semibold">Fecha de inicio:</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            disabled={cargando}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Fecha final:</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            disabled={cargando}
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btn-primary"
            onClick={generarInforme}
            disabled={cargando}
          >
            {cargando ? "Generando..." : "Generar Informe IVA"}
          </button>
        </div>
      </div>

      {ventas.length > 0 && (
        <div className="mb-3">
          <BotonDescargarPDF
            data={ventas}
            fileName="informe-iva.pdf"
            title="Informe de IVA"
            columns={[
              { label: "Número de Factura", key: "numeroFactura" },
              { label: "Cliente", key: "clienteNombre" },
              {
                label: "Fecha",
                render: (v) =>
                  new Date(v.fecha).toLocaleString("es-CO", {
                    timeZone: "America/Bogota",
                  }),
              },
              {
                label: "Total",
                render: (v) => `$${v.valorTotal?.toLocaleString()}`,
              },
              {
                label: "IVA",
                render: (v) => `$${v.valorIva?.toLocaleString()}`,
              },
            ]}
          />
        </div>
      )}

      {ventas.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Número de Factura</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>IVA</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.numeroFactura}>
                  <td>{v.numeroFactura}</td>
                  <td>{v.clienteNombre}</td>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
                  <td>${v.valorTotal?.toLocaleString()}</td>
                  <td>${v.valorIva?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-end">
                  Total IVA:
                </td>
                <td>${totalIva.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="text-end mt-4">
        <BotonVolver
          texto="← Volver al Módulo de Reportes"
          to="/reportes"
          className="btn-sm"
        />
      </div>
    </div>
  );
}
