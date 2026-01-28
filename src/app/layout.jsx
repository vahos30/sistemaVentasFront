import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Notificaciones from "./components/Notificaciones";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Sistema de Ventas",
  description: "Sistema para gestionar inventario y ventas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <Notificaciones />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
