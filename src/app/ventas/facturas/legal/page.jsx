"use client";

import React, { useState, useEffect, useRef } from "react";
import { obtenerClientes } from "@/app/services/clienteServices";
import { obtenerProductos } from "@/app/services/productosService";
import {
  crearFacturaLegal,
  descargarFacturaPDF,
} from "@/app/services/factusService";
import BotonBuscar from "@/app/components/BotonBuscar";
import BotonAgregar from "@/app/components/BotonAgregar";
import BotonCrear from "@/app/components/BotonCrear";
import BotonVolver from "@/app/components/BotonVolver";
import { toast } from "react-toastify";

const FORMAS_PAGO = [
  { codigo: "1", nombre: "Pago de contado" },
  { codigo: "2", nombre: "Pago a crédito" },
];

const METODOS_PAGO = [
  { codigo: "10", nombre: "Efectivo" },
  { codigo: "42", nombre: "Consignación" },
  { codigo: "47", nombre: "Transferencia" },
  { codigo: "49", nombre: "Tarjeta Débito" },
  { codigo: "48", nombre: "Tarjeta Crédito" },
];

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
  const [descuentoTipo, setDescuentoTipo] = useState("");
  const [descuentoValor, setDescuentoValor] = useState(0);

  const [productosFactura, setProductosFactura] = useState([]);
  const [facturaCreada, setFacturaCreada] = useState(null);
  const [creando, setCreando] = useState(false);

  // Forma y método de pago
  const [formaPago, setFormaPago] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [observacion, setObservacion] = useState("");

  // Errores
  const [errores, setErrores] = useState({});

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
    setDescuentoTipo("");
    setDescuentoValor(0);
  };

  // Agregar producto a la factura
  const handleAgregarProducto = () => {
    if (!productoSeleccionado) return;
    if (cantidad < 1 || cantidad > productoSeleccionado.cantidadStock) {
      toast.error("Cantidad inválida, verifique la cantidad en stock.");
      return;
    }
    if (
      descuentoTipo === "porcentaje" &&
      (descuentoValor < 0 || descuentoValor > 100)
    ) {
      toast.error("El descuento en porcentaje debe estar entre 0 y 100.");
      return;
    }
    if (descuentoTipo === "valor" && descuentoValor < 0) {
      toast.error("El descuento en valor no puede ser negativo.");
      return;
    }
    setProductosFactura((prev) => [
      ...prev,
      {
        ...productoSeleccionado,
        cantidad,
        precioUnitario: productoSeleccionado.precio,
        tipoDescuento:
          descuentoTipo === ""
            ? ""
            : descuentoTipo === "porcentaje"
            ? "Porcentaje"
            : "ValorAbsoluto",
        valorDescuento: descuentoValor,
      },
    ]);
    setProductoSeleccionado(null);
    setBusquedaProducto("");
    setCantidad(1);
    setDescuentoTipo("");
    setDescuentoValor(0);
  };

  // Eliminar producto de la lista
  const handleEliminarProducto = (id) => {
    setProductosFactura((prev) => prev.filter((p) => p.id !== id));
  };

  // Crear factura legal en la API
  const handleCrearFacturaLegal = async () => {
    const nuevosErrores = {};

    if (!cliente || productosFactura.length === 0) {
      toast.error("Debe seleccionar un cliente y al menos un producto.");
      return;
    }
    if (!formaPago) {
      nuevosErrores.formaPago = "Debe seleccionar la forma de pago.";
    }
    if (!metodoPago) {
      nuevosErrores.metodoPago = "Debe seleccionar el método de pago.";
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      // Enfoca el primer select con error
      if (nuevosErrores.formaPago) {
        document.querySelector('select[name="formaPago"]').focus();
      } else if (nuevosErrores.metodoPago) {
        document.querySelector('select[name="metodoPago"]').focus();
      }
      return;
    }

    setCreando(true);
    try {
      const detalles = productosFactura.map((p) => ({
        productoId: p.id,
        cantidad: p.cantidad,
        precioUnitario: p.precio,
        tipoDescuento: p.tipoDescuento,
        valorDescuento: p.valorDescuento,
      }));

      const facturaLegal = {
        clienteId: cliente.id,
        detalles,
        referencia: "",
        observacion,
        fechaVencimiento: "",
        formaPago,
        metodoPago,
      };

      const data = await crearFacturaLegal(facturaLegal);
      setFacturaCreada({
        factus: data.data, // respuesta de Factus
        cliente, // datos completos del cliente
        formaPago, // código de forma de pago
        metodoPago, // código de método de pago
        observacion, // observación
      });
      toast.success("Factura legal creada exitosamente");
    } catch (error) {
      toast.error(error.message || "Error al crear la factura legal");
      console.error("Error al crear la factura legal:", error);
    } finally {
      setCreando(false);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const numeroFactura = facturaCreada.factus.bill?.number;
      if (!numeroFactura) {
        toast.error("No se encontró el número de factura.");
        return;
      }
      const blob = await descargarFacturaPDF(numeroFactura);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factura_${numeroFactura}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error al descargar el PDF.");
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow mx-auto" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center text-primary">
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
                  <div className="card mb-3 border-primary">
                    <div className="card-body">
                      <h5 className="card-title text-primary">
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
                        <label className="ms-3 me-2 mb-0">Descuento:</label>
                        <select
                          className="form-select"
                          style={{ width: 180, minWidth: 150 }}
                          value={descuentoTipo}
                          onChange={(e) => setDescuentoTipo(e.target.value)}
                        >
                          <option value="">Sin descuento</option>
                          <option value="porcentaje">Porcentaje (%)</option>
                          <option value="valor">Valor ($)</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          max={
                            descuentoTipo === "porcentaje"
                              ? 100
                              : productoSeleccionado.precio * cantidad
                          }
                          value={descuentoValor}
                          onChange={(e) =>
                            setDescuentoValor(Number(e.target.value))
                          }
                          className="form-control"
                          style={{ width: 100, minWidth: 80 }}
                          placeholder={
                            descuentoTipo === "porcentaje"
                              ? "%"
                              : descuentoTipo === "valor"
                              ? "$"
                              : ""
                          }
                          disabled={descuentoTipo === ""}
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

                {productosFactura.length > 0 && (
                  <>
                    {/* Tabla de productos agregados */}
                    <div className="mt-4">
                      <h5 className="mb-3 text-success">
                        Productos en la factura
                      </h5>
                      <div style={{ maxWidth: "100%", overflowX: "auto" }}>
                        <table
                          className="table tabla-detalle-recibo mb-0"
                          style={{ minWidth: 900 }}
                        >
                          <thead>
                            <tr>
                              <th>Cantidad</th>
                              <th>Producto</th>
                              <th>Referencia</th>
                              <th>Descripción</th>
                              <th>Precio Unitario</th>
                              <th>Descuento</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {productosFactura.map((p) => (
                              <tr key={p.id}>
                                <td>{p.cantidad}</td>
                                <td>{p.nombre}</td>
                                <td>{p.referencia}</td>
                                <td>{p.descripcion}</td>
                                <td>${p.precio.toLocaleString()}</td>
                                <td>
                                  {p.tipoDescuento === ""
                                    ? "Sin descuento"
                                    : p.tipoDescuento === "Porcentaje"
                                    ? `${p.valorDescuento}%`
                                    : `$${p.valorDescuento}`}
                                </td>
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

                    {/* Observación */}
                    <div className="mb-3 mt-4">
                      <label className="form-label">Observación:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        placeholder="Observación para la factura"
                      />
                    </div>

                    {/* Forma de pago y método de pago */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label">Forma de Pago:</label>
                        <select
                          className={`form-select ${
                            errores.formaPago ? "is-invalid" : ""
                          }`}
                          value={formaPago}
                          onChange={(e) => setFormaPago(e.target.value)}
                          name="formaPago"
                        >
                          <option value="">Seleccione</option>
                          {FORMAS_PAGO.map((fp) => (
                            <option key={fp.codigo} value={fp.codigo}>
                              {fp.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.formaPago && (
                          <div className="invalid-feedback d-block">
                            {errores.formaPago}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Método de Pago:</label>
                        <select
                          className={`form-select ${
                            errores.metodoPago ? "is-invalid" : ""
                          }`}
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value)}
                          name="metodoPago"
                        >
                          <option value="">Seleccione</option>
                          {METODOS_PAGO.map((mp) => (
                            <option key={mp.codigo} value={mp.codigo}>
                              {mp.nombre}
                            </option>
                          ))}
                        </select>
                        {errores.metodoPago && (
                          <div className="invalid-feedback d-block">
                            {errores.metodoPago}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón para crear factura legal */}
                    <div className="text-end mt-3">
                      <BotonCrear
                        onClick={handleCrearFacturaLegal}
                        texto={creando ? "Creando..." : "Crear Factura Legal"}
                        disabled={creando}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </form>

          {/* Mostrar factura legal creada */}
          {facturaCreada && (
            <div className="mt-5">
              <div className="card border-success">
                <div className="card-body">
                  <h4 className="text-success mb-3">
                    Factura legal creada exitosamente
                  </h4>
                  <div>
                    <strong>Número de factura:</strong>{" "}
                    {facturaCreada.factus.bill?.number}
                  </div>
                  <div>
                    <strong>Referencia:</strong>{" "}
                    {facturaCreada.factus.bill?.reference_code}
                  </div>
                  <div>
                    <strong>Cliente:</strong> {facturaCreada.cliente.nombre}{" "}
                    {facturaCreada.cliente.apellido}
                  </div>
                  <div>
                    <strong>Tipo de Documento:</strong>{" "}
                    {facturaCreada.cliente.tipoDocumento}
                  </div>
                  <div>
                    <strong>Número de Documento:</strong>{" "}
                    {facturaCreada.cliente.numeroDocumento}
                  </div>
                  <div>
                    <strong>Dirección:</strong>{" "}
                    {facturaCreada.cliente.direccion}
                  </div>
                  <div>
                    <strong>Ciudad:</strong> {facturaCreada.cliente.ciudad}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {facturaCreada.cliente.telefono}
                  </div>
                  <div>
                    <strong>Email:</strong> {facturaCreada.cliente.email}
                  </div>
                  {facturaCreada.cliente.razonSocial && (
                    <div>
                      <strong>Razón Social:</strong>{" "}
                      {facturaCreada.cliente.razonSocial}
                    </div>
                  )}
                  <div>
                    <strong>Forma de Pago:</strong>{" "}
                    {
                      FORMAS_PAGO.find(
                        (fp) => fp.codigo === facturaCreada.formaPago
                      )?.nombre
                    }
                  </div>
                  <div>
                    <strong>Método de Pago:</strong>{" "}
                    {
                      METODOS_PAGO.find(
                        (mp) => mp.codigo === facturaCreada.metodoPago
                      )?.nombre
                    }
                  </div>
                  <div>
                    <strong>Observación:</strong> {facturaCreada.observacion}
                  </div>
                  <div>
                    <strong>Total:</strong> ${facturaCreada.factus.bill?.total}
                  </div>
                  <div>
                    <strong>IVA:</strong> $
                    {facturaCreada.factus.bill?.tax_amount}
                  </div>
                  <div className="mt-3 table-responsive">
                    <table className="table table-bordered align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th>IVA</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(facturaCreada.factus?.items) &&
                          facturaCreada.factus.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>${item.price}</td>
                              <td>{item.tax_rate}%</td>
                              <td>${item.total}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {facturaCreada.factus.bill?.number && (
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-success"
                        onClick={handleDescargarPDF}
                      >
                        Descargar PDF
                      </button>
                    </div>
                  )}
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
