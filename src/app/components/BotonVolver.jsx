"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function BotonVolver({ texto = "Volver" }) {
  const router = useRouter();

  const manejarClick = () => {
    router.back();
  };

  return (
    <button
      onClick={manejarClick}
      className="btn boton-volver-profesional"
      aria-label={`Volver a la página anterior`}
    >
      <i className="bi bi-arrow-left-circle-fill me-2"></i>
      {texto}
    </button>
  );
}
