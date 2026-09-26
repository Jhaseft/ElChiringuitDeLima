import { useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Pen, Trash2, Plus } from "lucide-react";
import AdminModal from "./AdminModal";

export default function AdminsTable({ admins, roles, notify }) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selected, setSelected] = useState(null);

    const recargar = () => router.reload({ preserveScroll: true, only: ["admins"] });

    const handleDelete = async (admin) => {
        if (!confirm(`¿Eliminar al administrador "${admin.username}"?`)) return;
        try {
            await axios.delete(`/admin/dashboard/administradores/admins/${admin.id}`, {
                withCredentials: true,
            });
            notify("success", "Administrador eliminado");
            recargar();
        } catch (err) {
            notify("error", err.response?.data?.message ?? "Error al eliminar");
        }
    };

    const onSaved = (msg) => {
        setOpenCreate(false);
        setOpenEdit(false);
        notify("success", msg);
        recargar();
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setOpenCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Nuevo administrador
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {admins.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-gray-400 text-sm">
                                    No hay administradores
                                </td>
                            </tr>
                        ) : (
                            admins.map((a) => (
                                <tr key={a.id} className="hover:bg-blue-50/30 transition">
                                    <td className="py-3 px-4 font-semibold text-gray-800">{a.username}</td>
                                    <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{a.email}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                                            {a.role?.name ?? "Sin rol"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelected(a);
                                                    setOpenEdit(true);
                                                }}
                                                title="Editar"
                                                className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                            >
                                                <Pen size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a)}
                                                title="Eliminar"
                                                className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AdminModal
                isOpen={openCreate}
                onClose={() => setOpenCreate(false)}
                onSaved={onSaved}
                onError={(m) => notify("error", m)}
                roles={roles}
            />
            <AdminModal
                isOpen={openEdit}
                onClose={() => setOpenEdit(false)}
                onSaved={onSaved}
                onError={(m) => notify("error", m)}
                admin={selected}
                roles={roles}
            />
        </div>
    );
}
