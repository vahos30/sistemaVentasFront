"use client";

export default function BotonGuardar({ onClick, texto = "Guardar" }) {
  return (
    <button
      type="button"
      className="btn btn-success w-50 mt-3"
      onClick={onClick}
    >
      {texto}
    </button>
  );
}
