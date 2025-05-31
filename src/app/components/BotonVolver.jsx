"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function BotonVolver({ texto = "Volver" }) {
  const router = useRouter();

  const manejarClick = () => {
    router.back();
  };

  return (
    <button onClick={manejarClick} className="btn mt-3 boton-volver">
      {texto}
    </button>
  );
}
