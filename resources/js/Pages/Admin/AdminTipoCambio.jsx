// resources/js/Pages/Admin/AdminTipoCambio.jsx
import AdminHeader from "@/Components/admin/AdminHeader.jsx";
import TipoCambioForm from "@/Components/admin/TipoCambioForm";
import AdminUserMediaTable from "@/Components/admin/AdminUserMediaTable";

export default function AdminTipoCambio({ tipoCambio }) {
  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <AdminHeader onLogout={handleLogout} />

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center w-full space-y-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
          Panel Administrativo
        </h1>

        {/* --- Tabla de Usuarios KYC --- */}
        <section className="w-full max-w-6xl">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Usuarios KYC
            </h2>
            <AdminUserMediaTable />
          </div>
        </section>

        {/* --- Tipo de Cambio --- */}
        <section className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Tipo de Cambio
            </h2>
            <TipoCambioForm tipoCambio={tipoCambio} />
          </div>
        </section>
      </main>
    </div>
  );
}
