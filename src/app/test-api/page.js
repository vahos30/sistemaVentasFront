"use client"; // Necesario para usar hooks y efectos
import { useEffect, useState } from "react";
import { getClientes } from "@/services/clienteService";

export default function TestApiPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        setError("Error al cargar clientes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando clientes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Clientes (Desde API)</h1>
      <ul className="space-y-2">
        {clientes.map((cliente) => (
          <li key={cliente.id} className="border p-3 rounded-lg">
            <p>
              <strong>Nombre:</strong> {cliente.nombre} {cliente.apellido}
            </p>
            <p>
              <strong>Documento:</strong> {cliente.numeroDocumento}
            </p>
            <p>
              <strong>Email:</strong> {cliente.email}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
