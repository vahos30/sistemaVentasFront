// app/components/Loader.jsx
import React from "react";

export default function Loader({ mensaje = "Cargando..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">{mensaje}</p>
      </div>
    </div>
  );
}
