"use client";

import Link from "next/link";

export default function Productos() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Productos</h2>

          <div className="d-grid gap-3 col-6 mx-auto">
            <Link href="/productos/todos" className="btn btn-info btn-lg">
              Ver todos los productos
            </Link>
            <Link href="/productos/nuevo" className="btn btn-secondary btn-lg">
              Crear un nuevo producto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
