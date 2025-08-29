"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { obtenerPerfil } from "@/app/services/usuariosService";

export default function MenuLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMenuOpen(true);
  }, [pathname]);

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const perfil = await obtenerPerfil();
        setUsuario(perfil);
      } catch (error) {
        toast.error(error.message || "No se pudo obtener el perfil.");
      }
    }
    cargarPerfil();
  }, []);

  const handleCerrarSesion = () => {
    toast(
      ({ closeToast }) => (
        <div>
          <div className="mb-2">¿Está seguro de cerrar la sesión?</div>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                closeToast();
                // Aquí puedes limpiar el token si lo usas
                localStorage.removeItem("token");
                router.push("/");
              }}
            >
              Sí
            </button>
            <button className="btn btn-secondary btn-sm" onClick={closeToast}>
              No
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

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
              <div>
                <h6 className="mb-0 fw-bold">
                  {usuario
                    ? usuario.roles && usuario.roles[0] === "Administrador"
                      ? "Administrador"
                      : "Vendedor"
                    : "Usuario"}
                </h6>
                <small className="text-light">
                  {usuario ? usuario.userName : ""}
                </small>
                <br />
                <small className="text-light">
                  {usuario ? usuario.email : ""}
                </small>
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
              <Link
                className="nav-link d-flex align-items-center"
                href="/proveedor"
              >
                <i className="bi bi-gear me-3 fs-5"></i>
                <span>Proveedores</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link d-flex align-items-center"
                href="/compras"
              >
                <i className="bi bi-gear me-3 fs-5"></i>
                <span>Compras</span>
              </Link>
            </li>
          </ul>

          <div className="mt-auto p-3 menu-footer">
            <button
              className="btn btn-outline-light w-100"
              onClick={handleCerrarSesion}
            >
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
