import React, { useState } from "react";

export default function ModalAnulacionParcial({ compra, onClose, onConfirm }) {
  const [detalles, setDetalles] = useState(
    compra.detalles.map((d) => ({
      productoId: d.producto.id,
      cantidadAAnular: 0,
      motivoDevolucion: "",
      nombre: d.producto.nombre,
      cantidadMax: d.cantidad,
    }))
  );

  const handleChange = (idx, field, value) => {
    setDetalles((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const detallesValidos = detalles.filter((d) => d.cantidadAAnular > 0);
    if (detallesValidos.length === 0) {
      alert("Debe anular al menos un producto.");
      return;
    }
    onConfirm(detallesValidos);
  };

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      style={{
        display: "block",
        background: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1050,
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Anulación Parcial de Compra</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad comprada</th>
                    <th>Cantidad a anular</th>
                    <th>Motivo de devolución</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((d, idx) => (
                    <tr key={d.productoId}>
                      <td>{d.nombre}</td>
                      <td>{d.cantidadMax}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={d.cantidadMax}
                          value={d.cantidadAAnular}
                          className="form-control"
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "cantidadAAnular",
                              Math.max(
                                0,
                                Math.min(d.cantidadMax, Number(e.target.value))
                              )
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={d.motivoDevolucion}
                          className="form-control"
                          onChange={(e) =>
                            handleChange(
                              idx,
                              "motivoDevolucion",
                              e.target.value
                            )
                          }
                          placeholder="Motivo de devolución"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-warning">
                Anular Parcialmente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
