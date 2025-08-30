"use client";
import { useEffect, useState } from "react";
import { listarUsuarios } from "@/app/services/usuariosService";
import { toast } from "react-toastify";
import BotonVolver from "@/app/components/BotonVolver";

export default function ListaUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const data = await listarUsuarios();
        setUsuarios(data);
      } catch (error) {
        toast.error(error.message || "Error al cargar usuarios.");
      } finally {
        setCargando(false);
      }
    }
    cargarUsuarios();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Usuarios Registrados</h2>
        <BotonVolver texto="← Volver a Configuración" to="/configuracion" />
      </div>
      {cargando ? (
        <div className="text-center my-5">
          <span className="spinner-border text-primary" role="status" />
          <span className="ms-2">Cargando usuarios...</span>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="alert alert-info text-center">
          No hay usuarios registrados.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre de usuario</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, idx) => (
                <tr key={u.id}>
                  <td>{idx + 1}</td>
                  <td>{u.userName}</td>
                  <td>{u.email}</td>
                  <td>{u.roles && u.roles.length > 0 ? u.roles[0] : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
