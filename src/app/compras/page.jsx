"use client";

import Link from "next/link";

export default function Compras() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Compras</h2>
          <div className="d-grid gap-3 col-6 mx-auto">
            <Link href="/compras/todas" className="btn btn-success btn-lg">
              Ver todas las Compras
            </Link>
            <Link
              href="/compras/nueva"
              className="btn btn-warning btn-lg text-white"
            >
              Crear Nueva Compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
