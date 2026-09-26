import { useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Pen, Trash2, Plus, ShieldCheck } from "lucide-react";
import RoleModal from "./RoleModal";

export default function RolesTable({ roles, modules, notify }) {
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selected, setSelected] = useState(null);

    const recargar = () => router.reload({ preserveScroll: true, only: ["roles", "admins"] });

    const handleDelete = async (role) => {
        if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return;
        try {
            await axios.delete(`/admin/dashboard/administradores/roles/${role.id}`, {
                withCredentials: true,
            });
            notify("success", "Rol eliminado");
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

    const permsLabel = (role) => {
        if (role.is_super) return "Acceso total";
        const keys = role.permissions ?? [];
        if (keys.length === 0) return "Sin pestanas";
        return keys.map((k) => modules[k] ?? k).join(", ");
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setOpenCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Nuevo rol
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pestanas</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-10 text-center text-gray-400 text-sm">
                                    No hay roles
                                </td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id} className="hover:bg-blue-50/30 transition">
                                    <td className="py-3 px-4 font-semibold text-gray-800">
                                        <span className="inline-flex items-center gap-2">
                                            {role.is_super && <ShieldCheck size={16} className="text-blue-600" />}
                                            {role.name}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 max-w-md">{permsLabel(role)}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelected(role);
                                                    setOpenEdit(true);
                                                }}
                                                title="Editar"
                                                className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                            >
                                                <Pen size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role)}
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

            <RoleModal
                isOpen={openCreate}
                onClose={() => setOpenCreate(false)}
                onSaved={onSaved}
                onError={(m) => notify("error", m)}
                modules={modules}
            />
            <RoleModal
                isOpen={openEdit}
                onClose={() => setOpenEdit(false)}
                onSaved={onSaved}
                onError={(m) => notify("error", m)}
                role={selected}
                modules={modules}
            />
        </div>
    );
}
