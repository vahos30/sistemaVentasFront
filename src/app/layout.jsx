import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Notificaciones from "./components/Notificaciones";

export const metadata = {
  title: "Sistema de Ventas",
  description: "Sistema para gestionar inventario y ventas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
      <Notificaciones />
    </html>
  );
}
