"use client";
import React from "react";

export default function BotonBuscar({
  onClick,
  texto = "Buscar",
  className = "",
}) {
  return (
    <button
      type="button"
      className={`btn btn-primary d-flex align-items-center ${className}`}
      onClick={onClick}
    >
      <i className="bi bi-search me-2"></i>
      {texto}
    </button>
  );
}
