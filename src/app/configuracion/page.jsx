"use client";

import Link from "next/link";

export default function ConfiguracionPage() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Configuración</h2>
          <div className="d-grid gap-3 col-6 mx-auto">
            <Link
              href="/configuracion/lista"
              className="btn btn-primary btn-lg"
            >
              Ver lista de usuarios
            </Link>
            <Link
              href="/configuracion/recuperar"
              className="btn btn-warning btn-lg text-white"
            >
              Recuperar contraseña de usuarios
            </Link>
            <Link
              href="/configuracion/crear-vendedor"
              className="btn btn-success btn-lg"
            >
              Crear Vendedores
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
