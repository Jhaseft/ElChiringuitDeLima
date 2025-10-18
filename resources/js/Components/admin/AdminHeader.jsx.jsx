import { LogOut, Shield } from "lucide-react";

export default function AdminHeader() {
  const handleLogout = async () => {
    const token = document.querySelector('meta[name="csrf-token"]').content;

    try {
      await fetch("/admin/logout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
          "Accept": "application/json",
        },
      });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 shadow-md rounded-b-2xl">
      {/* Logo / Título */}
      <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left">
        <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        <h1 className="text-lg sm:text-2xl font-extrabold tracking-wide leading-tight">
          Panel de Administración
        </h1>
      </div>

      {/* Botón Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition shadow w-full sm:w-auto justify-center"
      >
        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Cerrar sesión</span>
      </button>
    </header>
  );
}
