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
      window.location.href = "/admin/login"; // Redirigir al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg sm:text-2xl font-bold">Administración</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
      >
        Cerrar sesión
      </button>
    </header>
  );
}
