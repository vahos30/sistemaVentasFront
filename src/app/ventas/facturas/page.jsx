"use client";

import Link from "next/link";
import BotonVolver from "@/app/components/BotonVolver";

export default function ModuloFacturas() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Facturas</h2>
          <div className="d-grid gap-3 col-6 mx-auto">
            <Link
              href="/ventas/facturas/todos"
              className="btn btn-danger btn-lg"
              style={{
                fontWeight: "bold",
                letterSpacing: "1px",
                fontFamily: "inherit",
              }}
            >
              Ver todas las Facturas
            </Link>
            <Link
              href="/ventas/facturas/legal"
              className="btn btn-success btn-lg"
              style={{
                fontWeight: "bold",
                letterSpacing: "1px",
                fontFamily: "inherit",
              }}
            >
              Crear Nueva Factura Legal
            </Link>
          </div>
          <div className="mt-4 text-end">
            <BotonVolver
              texto="← Volver al Modulo de Ventas"
              to="/ventas"
              className="btn-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
