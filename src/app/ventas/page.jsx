"use client";

import Link from "next/link";

export default function Ventas() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Ventas</h2>
          <div className="d-grid gap-3 col-6 mx-auto">
            <Link href="/ventas/recibos" className="btn btn-success btn-lg">
              Recibos
            </Link>
            <Link
              href="/ventas/facturas"
              className="btn btn-warning btn-lg text-white"
            >
              Facturas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
