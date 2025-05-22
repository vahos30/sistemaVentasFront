import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100">
      {/* Navbar Simple */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-bold text-indigo-600">
            Sistema de Ventas
          </span>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-indigo-600">
              Ingresar
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Gestiona tus <span className="text-indigo-600">ventas</span> y{" "}
          <span className="text-indigo-600">clientes</span> fácilmente
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Optimiza tu inventario, controla tus transacciones y lleva tu negocio
          al siguiente nivel.
        </p>
        <div className="space-x-4">
          <Link
            href="login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700"
          >
            Comenzar ahora
          </Link>
          <Link
            href="/features"
            className="text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg text-lg hover:bg-indigo-50"
          >
            Conocer más
          </Link>
        </div>
      </div>

      {/* Imagen de muestra (reemplázala con tu propia imagen) */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Sistema de Ventas"
            className="w-full h-auto object-cover"
          />
          <div className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-gray-800">
              Control total en tus manos
            </h3>
            <p className="text-gray-600 mt-2">
              Interfaz intuitiva diseñada para simplificar tu flujo de trabajo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
