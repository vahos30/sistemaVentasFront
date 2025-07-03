"use client";
import React from "react";

export default function BotonAgregar({
  onClick,
  texto = "Agregar",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={`btn btn-success d-flex align-items-center ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <i className="bi bi-plus-circle me-2"></i>
      {texto}
    </button>
  );
}
