"use client";

import Link from "next/link";

export default function Clientes() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Clientes</h2>

          <div className="d-grid gap-3 col-6 mx-auto">
            <Link href="/Clientes/todos" className="btn btn-primary btn-lg">
              Ver todos los clientes
            </Link>
            <Link href="/clientes/nuevo" className="btn btn-success btn-lg">
              Crear un nuevo cliente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
