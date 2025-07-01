"use client";

import Link from "next/link";
import BotonVolver from "@/app/components/BotonVolver";

export default function ModuloRecibos() {
  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-body text-center">
          <h2 className="card-title mb-4">Módulo de Recibos</h2>
          <div className="d-grid gap-3 col-6 mx-auto">
            <Link
              href="/ventas/recibos/todos"
              className="btn btn-primary btn-lg"
            >
              Ver todos los Recibos
            </Link>
            <Link
              href="/ventas/recibos/nuevo"
              className="btn btn-info btn-lg text-white"
            >
              Crear un nuevo Recibo
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
