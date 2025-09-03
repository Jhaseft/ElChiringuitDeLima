// resources/js/Pages/Admin/AdminTipoCambio.jsx
import { useRef } from "react";
import { motion } from "framer-motion";
import AdminHeader from "@/Components/admin/AdminHeader.jsx";
import TipoCambioForm from "@/Components/admin/TipoCambioForm";
import AdminUserMediaTable from "@/Components/admin/AdminUserMediaTable";

export default function AdminTipoCambio({ tipoCambio }) {
  const tipoCambioRef = useRef(null);
  const usuariosRef = useRef(null);
  const transferenciasRef = useRef(null);

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 flex flex-col">
      {/* Header */}
      <AdminHeader onLogout={handleLogout} />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center space-y-10 px-4">
        <motion.h1
          className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-gray-800 drop-shadow-lg leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Bienvenido <span className="text-pink-500">Admin</span> 🚀
        </motion.h1>

        {/* Botones de acciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full max-w-4xl">
          <button
            onClick={() => scrollToSection(tipoCambioRef)}
            className="px-6 py-4 bg-white rounded-2xl shadow-lg text-base sm:text-lg font-semibold text-gray-800 hover:bg-pink-100 transition w-full"
          >
            Actualizar Tipo de Cambio
          </button>
          <button
            onClick={() => scrollToSection(usuariosRef)}
            className="px-6 py-4 bg-white rounded-2xl shadow-lg text-base sm:text-lg font-semibold text-gray-800 hover:bg-yellow-100 transition w-full"
          >
            Ver Usuarios
          </button>
          <button
            onClick={() => scrollToSection(transferenciasRef)}
            className="px-6 py-4 bg-white rounded-2xl shadow-lg text-base sm:text-lg font-semibold text-gray-800 hover:bg-blue-100 transition w-full"
          >
            Ver Transferencias
          </button>
        </div>
      </section>

      {/* Sección Tipo de Cambio */}
      <section
        ref={tipoCambioRef}
        className="min-h-screen flex justify-center items-center px-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-3xl w-[95%] sm:w-full">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700 text-center">
            Actualizar Tipo de Cambio
          </h2>
          <TipoCambioForm tipoCambio={tipoCambio} />
        </div>
      </section>

      {/* Sección Usuarios */}
      <section
        ref={usuariosRef}
        className="min-h-screen flex justify-center items-center px-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-6xl w-[95%] sm:w-full">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700 text-center">
            Información de Usuarios
          </h2>
          <AdminUserMediaTable />
        </div>
      </section>

      {/* Sección Transferencias */}
      <section
        ref={transferenciasRef}
        className="min-h-screen flex justify-center items-center px-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 max-w-4xl w-[95%] sm:w-full text-center text-gray-500">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700">
            Transferencias de Usuarios
          </h2>
          <p>🚧 Esta sección está en desarrollo...</p>
        </div>
      </section>
    </div>
  );
}
