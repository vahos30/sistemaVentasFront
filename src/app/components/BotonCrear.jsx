"use client";
import React from "react";

export default function BotonCrear({
  onClick,
  texto = "Crear",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={`btn btn-primary d-flex align-items-center ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <i className="bi bi-check-circle me-2"></i>
      {texto}
    </button>
  );
}
