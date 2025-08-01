"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(true);
  }, [pathname]);

  return (
    <div className="d-flex flex-column vh-100">
      {/* Barra superior */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary-gradient px-3">
        <button
          className="btn btn-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon">
            <i className="bi bi-list"></i>
          </span>
          <span className="ms-2 menu-text">Menú</span>
        </button>

        <div className="d-flex align-items-center ms-3">
          <i className="bi bi-shop-window h3 text-white me-2"></i>
          <span className="navbar-brand mb-0 h1 fw-bold">
            Sistema de Ventas
          </span>
        </div>
      </nav>

      <div className="d-flex flex-grow-1">
        {/* Menú lateral */}
        <div
          className={`bg-menu text-white p-0 menu-lateral ${
            isMenuOpen ? "menu-abierto" : "menu-cerrado"
          }`}
        >
          <div className="menu-header p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="user-avatar me-3">
                <i className="bi bi-person-circle fs-2"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold">Administrador</h6>
                <small className="text-light">admin@ventas.com</small>
              </div>
            </div>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center ${
                  pathname === "/menuPrincipal" ? "active" : ""
                }`}
                href="/menuPrincipal"
              >
                <i className="bi bi-house-door me-3 fs-5"></i>
                <span>Inicio</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center ${
                  pathname === "/Clientes" ? "active" : ""
                }`}
                href="/Clientes"
              >
                <i className="bi bi-people me-3 fs-5"></i>
                <span>Clientes</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link d-flex align-items-center"
                href="/productos"
              >
                <i className="bi bi-box-seam me-3 fs-5"></i>
                <span>Productos</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link d-flex align-items-center"
                href="/ventas"
              >
                <i className="bi bi-receipt me-3 fs-5"></i>
                <span>Ventas</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link d-flex align-items-center"
                href="/reportes"
              >
                <i className="bi bi-graph-up me-3 fs-5"></i>
                <span>Reportes</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center" href="#">
                <i className="bi bi-gear me-3 fs-5"></i>
                <span>Configuración</span>
              </Link>
            </li>
          </ul>

          <div className="mt-auto p-3 menu-footer">
            <button className="btn btn-outline-light w-100">
              <i className="bi bi-box-arrow-right me-2"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-grow-1 p-4 bg-light contenido-principal">
          {children}
        </div>
      </div>
    </div>
  );
}
