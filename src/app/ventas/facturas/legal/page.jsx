"use client";

import React, { useState, useEffect, useRef } from "react";
import { obtenerClientes } from "@/app/services/clienteServices";
import { obtenerProductos } from "@/app/services/productosService";
import { obtenerTokenFactus } from "@/app/services/factusService";
import { toast } from "react-toastify";
import BotonBuscar from "@/app/components/BotonBuscar";
import BotonAgregar from "@/app/components/BotonAgregar";
import BotonCrear from "@/app/components/BotonCrear";
import BotonVolver from "@/app/components/BotonVolver";

export default function CrearFacturaLegalPage() {
  // Cliente
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cliente, setCliente] = useState(null);
  const [buscando, setBuscando] = useState(false);

  // Productos
  const [productos, setProductos] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [productosFactura, setProductosFactura] = useState([]);

  // Factura legal
  const [creando, setCreando] = useState(false);
  const [facturaLegal, setFacturaLegal] = useState(null);

  // Cargar productos disponibles
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data.filter((p) => p.cantidadStock > 0));
      } catch {
        toast.error("Error al cargar productos");
      }
    };
    cargarProductos();
  }, []);

  // Buscar cliente por número de documento
  const handleBuscarCliente = async () => {
    setCliente(null);
    if (!numeroDocumento.trim()) {
      toast.error("Por favor ingrese un número de documento.");
      return;
    }
    setBuscando(true);
    try {
      const clientes = await obtenerClientes();
      const encontrado = clientes.find(
        (c) => c.numeroDocumento === numeroDocumento.trim()
      );
      if (encontrado) {
        setCliente(encontrado);
        toast.success("Datos del cliente cargados exitosamente");
      } else {
        toast.error("El documento ingresado no está registrado en el sistema");
      }
    } catch (error) {
      toast.error("Error al buscar el cliente");
    } finally {
      setBuscando(false);
    }
  };

  // Filtrar productos por nombre o referencia
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.referencia.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  // Seleccionar producto
  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
  };

  // Agregar producto a la factura
  const handleAgregarProducto = () => {
    if (!productoSeleccionado) return;
    if (cantidad < 1 || cantidad > productoSeleccionado.cantidadStock) {
      toast.error("Cantidad inválida, verifique la cantidad en stock.");
      return;
    }
    setProductosFactura((prev) => [
      ...prev,
      {
        ...productoSeleccionado,
        cantidad,
      },
    ]);
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidad(1);
  };

  // Eliminar producto de la lista
  const handleEliminarProducto = (id) => {
    setProductosFactura((prev) => prev.filter((p) => p.id !== id));
  };

  // Mapear datos al formato de Factus
  function mapearFacturaFactus(cliente, productos) {
    return {
      numbering_range_id: 8, // Debes ajustar según tu configuración en Factus
      reference_code: "I3",
      observation: "",
      payment_form: "1",
      payment_due_date: "2024-12-30",
      payment_method_code: "10",
      operation_type: 10,
      send_email: false,
      order_reference: { reference_code: "ref-001", issue_date: "" },
      billing_period: {
        start_date: "2024-01-10",
        start_time: "00:00:00",
        end_date: "2024-02-09",
        end_time: "23:59:59",
      },
      establishment: {
        name: "Factus pro",
        address: "cra 01 # 223 - 22",
        phone_number: "123456789",
        email: "fatuspro@factus.co",
        municipality_id: "980",
      },
      customer: {
        identification: cliente.numeroDocumento,
        dv: "3",
        company: "",
        trade_name: "",
        names: `${cliente.nombre} ${cliente.apellido || ""}`,
        address: cliente.direccion,
        email: cliente.email,
        phone: cliente.telefono,
        legal_organization_id: "2",
        tribute_id: "21",
        identification_document_id: "3",
        municipality_id: "980",
      },
      items: productos.map((p) => ({
        scheme_id: "1",
        note: "",
        code_reference: p.referencia,
        name: p.nombre,
        quantity: p.cantidad,
        discount_rate: 0,
        price: p.precio,
        tax_rate: "19.00",
        unit_measure_id: 70,
        standard_code_id: 1,
        is_excluded: 0,
        tribute_id: 1,
        withholding_taxes: [],
      })),
    };
  }

  // Crear factura legal en Factus
  const handleCrearFacturaLegal = async () => {
    if (!cliente || productosFactura.length === 0) {
      toast.error("Debe seleccionar un cliente y al menos un producto.");
      return;
    }
    setCreando(true);
    try {
      // 1. Obtener el token de Factus
      const { access_token } = await obtenerTokenFactus();

      // 2. Mapear los datos
      const facturaFactus = mapearFacturaFactus(cliente, productosFactura);

      // 3. Consumir el endpoint de Factus
      const response = await fetch(
        "https://api-sandbox.factus.com.co/facturas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(facturaFactus),
        }
      );
      if (!response.ok) throw new Error("No se pudo crear la factura legal");
      const data = await response.json();
      setFacturaLegal(data);
      toast.success("Factura legal creada correctamente");
    } catch (error) {
      toast.error(error.message || "Error al crear la factura legal");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center text-success">
            Crear Factura Legal
          </h2>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Buscar cliente */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Ingrese el número de documento del cliente:
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Número de documento"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  disabled={buscando}
                />
                <BotonBuscar
                  onClick={handleBuscarCliente}
                  texto={buscando ? "Buscando..." : "Buscar"}
                  className="ms-2"
                />
              </div>
            </div>
            {cliente && (
              <div className="alert alert-success mt-3">
                <strong>Cliente encontrado:</strong>
                <div>
                  Nombre: {cliente.nombre} {cliente.apellido}
                </div>
                <div>Tipo Documento: {cliente.tipoDocumento}</div>
                <div>Número Documento: {cliente.numeroDocumento}</div>
                <div>Teléfono: {cliente.telefono}</div>
                <div>Dirección: {cliente.direccion}</div>
                <div>Email: {cliente.email}</div>
              </div>
            )}

            {/* Buscar y agregar productos */}
            {cliente && (
              <>
                <hr className="my-4" />
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Buscar producto por nombre o referencia:
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar producto..."
                      value={busquedaProducto}
                      onChange={(e) => {
                        setBusquedaProducto(e.target.value);
                        setProductoSeleccionado(null);
                      }}
                      disabled={productos.length === 0}
                      list="productos-list"
                    />
                    <datalist id="productos-list">
                      {productosFiltrados.map((p) => (
                        <option
                          key={p.id}
                          value={p.nombre + " (" + p.referencia + ")"}
                        />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      className="btn btn-outline-primary ms-2"
                      disabled={!busquedaProducto}
                      onClick={() => {
                        const prod = productos.find(
                          (p) =>
                            p.nombre.toLowerCase() ===
                              busquedaProducto.toLowerCase() ||
                            p.referencia.toLowerCase() ===
                              busquedaProducto.toLowerCase() ||
                            `${p.nombre} (${p.referencia})`.toLowerCase() ===
                              busquedaProducto.toLowerCase()
                        );
                        if (prod) handleSeleccionarProducto(prod);
                        else toast.error("Producto no encontrado");
                      }}
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>

                {/* Mostrar datos del producto seleccionado */}
                {productoSeleccionado && (
                  <div className="card mb-3 border-success">
                    <div className="card-body">
                      <h5 className="card-title text-success">
                        {productoSeleccionado.nombre}
                      </h5>
                      <div>
                        Referencia:{" "}
                        <strong>{productoSeleccionado.referencia}</strong>
                      </div>
                      <div>
                        Precio:{" "}
                        <strong>
                          ${productoSeleccionado.precio.toLocaleString()}
                        </strong>
                      </div>
                      <div>Descripción: {productoSeleccionado.descripcion}</div>

                      <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
                        <label className="me-2 mb-0">Cantidad:</label>
                        <input
                          type="number"
                          min={1}
                          max={productoSeleccionado.cantidadStock}
                          value={cantidad}
                          onChange={(e) => setCantidad(Number(e.target.value))}
                          className="form-control"
                          style={{ width: 80 }}
                        />
                        <BotonAgregar
                          onClick={handleAgregarProducto}
                          texto="Agregar a la factura"
                          className="ms-3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabla de productos agregados */}
                {productosFactura.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-3 text-success">
                      Productos en la factura
                    </h5>
                    <div style={{ maxWidth: "100%", overflowX: "auto" }}>
                      <table
                        className="table tabla-detalle-recibo mb-0"
                        style={{ minWidth: 800 }}
                      >
                        <thead>
                          <tr>
                            <th>Cantidad</th>
                            <th>Producto</th>
                            <th>Referencia</th>
                            <th>Precio Unitario</th>
                            <th>Descripción</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosFactura.map((p) => (
                            <tr key={p.id}>
                              <td>{p.cantidad}</td>
                              <td>{p.nombre}</td>
                              <td>{p.referencia}</td>
                              <td>${p.precio.toLocaleString()}</td>
                              <td>{p.descripcion}</td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleEliminarProducto(p.id)}
                                >
                                  Quitar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Botón para crear factura legal */}
                {productosFactura.length > 0 && (
                  <div className="text-end mt-3">
                    <BotonCrear
                      onClick={handleCrearFacturaLegal}
                      texto={creando ? "Creando..." : "Crear Factura Legal"}
                      disabled={creando}
                    />
                  </div>
                )}
              </>
            )}
          </form>

          {/* Mostrar factura legal creada */}
          {facturaLegal && (
            <div className="mt-5">
              <div className="card border-success">
                <div className="card-body">
                  <h4 className="text-success mb-3">
                    Factura legal creada exitosamente
                  </h4>
                  <pre
                    style={{ fontSize: 13, background: "#f8f9fa", padding: 12 }}
                  >
                    {JSON.stringify(facturaLegal, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Botón volver al final */}
          <div className="text-end">
            <BotonVolver
              texto="← Volver al Módulo de Facturas"
              to="/ventas/facturas"
              className="btn-sm mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
