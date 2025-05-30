"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function MenuLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="d-flex flex-column vh-100">
      {/* Barra superior */}
      <nav className="navbar navbar-dark bg-dark px-3">
        <button
          className="btn btn-outline-light"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰ Menú
        </button>
        <span className="navbar-brand mb-0 h1">Sistema de Ventas</span>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Menú lateral */}
        {isMenuOpen && (
          <div
            className="bg-secondary text-white p-3"
            style={{ width: "220px" }}
          >
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-white" href="/menuPrincipal">
                  Inicio
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/Clientes">
                  Clientes
                </Link>
              </li>
              {/* Agrega más opciones aquí si deseas */}
            </ul>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex-grow-1 p-4 bg-light">{children}</div>
      </div>
    </div>
  );
}
