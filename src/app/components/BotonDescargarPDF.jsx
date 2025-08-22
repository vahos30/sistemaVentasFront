import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BotonDescargarPDF({
  data,
  columns,
  fileName = "reporte.pdf",
  title = "Reporte",
}) {
  const handleDescargarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [columns.map((col) => col.label)],
      body: data.map((row) =>
        columns.map((col) => (col.render ? col.render(row) : row[col.key]))
      ),
      styles: { fontSize: 10 },
    });

    doc.save(fileName);
  };

  return (
    <button
      className="btn btn-outline-success me-3"
      onClick={handleDescargarPDF}
      disabled={data.length === 0}
    >
      <i className="bi bi-file-earmark-pdf me-2"></i>
      Descargar en PDF
    </button>
  );
}
