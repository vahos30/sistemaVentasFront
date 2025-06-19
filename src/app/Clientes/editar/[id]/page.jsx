// app/Clientes/editar/[id]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerClientePorId,
  actualizarCliente,
} from "@/app/services/clienteServices";
import FormularioCliente from "@/app/components/FormularioCliente";
import BotonVolver from "@/app/components/BotonVolver";
import Loader from "@/app/components/Loader";
import { toast } from "react-toastify";

export default function EditarCliente({ params }) {
  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();
  const { id } = params;

  // Cargar cliente al montar el componente
  useEffect(() => {
    const cargarCliente = async () => {
      try {
        const data = await obtenerClientePorId(id);
        setCliente(data);
        setErrores({});
      } catch (error) {
        console.error("Error cargando cliente:", error);
        toast.error(`Error al cargar el cliente: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        setErrores({ general: error.message });
      } finally {
        setCargando(false);
      }
    };

    cargarCliente();
  }, [id]);

  // Manejar actualización del cliente
  const handleActualizar = async (datos) => {
    setEnviando(true);
    setErrores({});

    try {
      await actualizarCliente(id, datos);
      toast.success("¡Cliente actualizado exitosamente!", {
        position: "top-center",
        autoClose: 1000,
        onClose: () => router.replace("/Clientes/todos"),
      });
    } catch (error) {
      console.error("Error actualizando cliente:", error);

      // Manejar errores de validación
      if (error.response && error.response.data.errors) {
        const validationErrors = {};
        for (const key in error.response.data.errors) {
          validationErrors[key] = error.response.data.errors[key].join(", ");
        }
        setErrores(validationErrors);
        toast.error("Por favor corrige los errores en el formulario", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        setErrores({ general: error.message });
        toast.error(`Error al actualizar: ${error.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setEnviando(false);
    }
  };

  // Mostrar loader mientras carga
  if (cargando) {
    return <Loader mensaje="Cargando datos del cliente..." />;
  }

  // Mostrar error si no se encontró el cliente
  if (!cliente) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <h4>Error al cargar el cliente</h4>
          <p>
            {errores.general ||
              "El cliente solicitado no existe o no se pudo cargar."}
          </p>
          <BotonVolver
            texto="Volver al listado"
            onClick={() => router.replace("/Clientes/todos")}
            className="mt-3"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Editar Cliente</h2>
        <BotonVolver
          texto="← Volver al listado"
          onClick={() => router.push("/Clientes/todos")}
        />
      </div>

      {errores.general && (
        <div className="alert alert-danger mb-4">{errores.general}</div>
      )}

      <FormularioCliente
        datosIniciales={cliente}
        onSubmit={handleActualizar}
        modoEdicion={true}
        errores={errores}
      />

      {enviando && (
        <div className="overlay-envio">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Actualizando...</span>
          </div>
          <p className="mt-2">Actualizando cliente...</p>
        </div>
      )}
    </div>
  );
}
