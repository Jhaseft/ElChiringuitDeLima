import { Link, usePage } from "@inertiajs/react";
import { LogOut, DollarSign, Users, ArrowLeftRight, Home, Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({ children }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        window.location.href = "/logout";
    };

    const menu = [
        { name: "Inicio", href: "/admin/dashboard", icon: <Home size={18} /> },
        { name: "Tipo de Cambio", href: "/admin/dashboard/tipo-cambio", icon: <DollarSign size={18} /> },
        { name: "Usuarios", href: "/admin/dashboard/usuarios", icon: <Users size={18} /> },
        { name: "Transferencias", href: "/admin/dashboard/transferencias", icon: <ArrowLeftRight size={18} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="p-6 border-b flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-blue-500">Admin Panel</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-700 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menu.map((item) => {
                        const isActive =
                            item.href === "/admin/dashboard"
                                ? url === item.href
                                : url.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium
                                    ${isActive
                                        ? "bg-blue-500 text-white shadow"
                                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-xl hover:bg-black transition"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

        
            <div className="flex-1 flex flex-col lg:ml-64 min-w-0">

             
                <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-600 hover:text-blue-500 transition p-1 rounded-lg hover:bg-blue-50"
                    >
                        <Menu size={22} />
                    </button>
                    <h1 className="text-lg font-bold text-blue-500">Admin Panel</h1>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

        </div>
    );
}
