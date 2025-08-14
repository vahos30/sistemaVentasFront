"use client";

import Link from "next/link";

export default function Proveedor() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Proveedores</h2>

          <div className="d-grid gap-3 col-6 mx-auto">
            <Link href="/proveedor/todos" className="btn btn-info btn-lg">
              Ver todos los Proveedores
            </Link>
            <Link href="/proveedor/nuevo" className="btn btn-warning btn-lg">
              Crear un nuevo Proveedor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
