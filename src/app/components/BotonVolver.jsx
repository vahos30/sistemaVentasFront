"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function BotonVolver({ texto = "Volver", to, className = "" }) {
  const router = useRouter();

  const manejarClick = () => {
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={manejarClick}
      className={`btn boton-volver-profesional ${className}`}
      aria-label={`Volver a la página anterior`}
    >
      <i className="bi bi-arrow-left-circle-fill me-2"></i>
      {texto}
    </button>
  );
}
