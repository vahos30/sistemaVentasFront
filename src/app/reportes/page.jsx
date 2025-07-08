"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ReportesPage() {
  const router = useRouter();

  const botones = [
    {
      texto: "Reporte de Inventario",
      color: "primary",
      icono: "bi-box-seam",
      ruta: "/reportes/inventario",
    },
    {
      texto: "Ventas por Cliente",
      color: "success",
      icono: "bi-person-lines-fill",
      ruta: "/reportes/ventas-cliente",
    },
    {
      texto: "Reporte de Ventas Diarias",
      color: "warning",
      icono: "bi-calendar2-week",
      ruta: "/reportes/ventas-diarias",
    },
    {
      texto: "Reporte de Ventas",
      color: "info",
      icono: "bi-bar-chart-line",
      ruta: "/reportes/ventas",
    },
    {
      texto: "Reporte de Compras",
      color: "secondary",
      icono: "bi-cart-check",
      ruta: "/reportes/compras",
    },
  ];

  return (
    <div className="container py-5">
      <div className="card shadow reporte-card">
        <div className="card-body">
          <h2 className="text-center mb-4 text-black">Reportes del Sistema</h2>
          <div className="d-flex flex-column gap-4">
            {botones.map((btn) => (
              <button
                key={btn.texto}
                className={`btn btn-${btn.color} reporte-btn`}
                onClick={() => router.push(btn.ruta)}
              >
                <i className={`bi ${btn.icono}`}></i>
                {btn.texto}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
