import { useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Pen, Trash2, ImageIcon, Plus } from "lucide-react";
import AdminOverlay from "../AdminOverlay";
import MetodoModal from "./MetodoModal";

export default function AdminMetodosTable({ metodos: initialMetodos }) {
    const [metodos, setMetodos] = useState(initialMetodos);
    const [overlay, setOverlay] = useState(null);
    const [overlayMsg, setOverlayMsg] = useState(null);

    // Modal crear
    const [openCreate, setOpenCreate] = useState(false);

    // Modal editar
    const [openEdit, setOpenEdit] = useState(false);
    const [selected, setSelected] = useState(null);

    const recargar = () => {
        router.reload({ preserveScroll: true, only: ["metodos"],
            onSuccess: (page) => {
                setMetodos(page.props.metodos ?? initialMetodos);
            },
        });
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que quieres eliminar este método?")) return;
        try {
            setOverlay("loading");
            await axios.delete(`/admin/dashboard/metodos/${id}`, { withCredentials: true });
            setOverlayMsg("Método eliminado");
            setOverlay("success");
            setMetodos((prev) => prev.filter((m) => m.id !== id));
        } catch {
            setOverlayMsg("Error al eliminar");
            setOverlay("error");
        }
    };

    const handleEdit = (metodo) => {
        setSelected(metodo);
        setOpenEdit(true);
    };

    const onSaved = () => {
        setOpenCreate(false);
        setOpenEdit(false);
        setOverlayMsg(null);
        setOverlay("success");
        recargar();
    };

    return (
        <div>
            <AdminOverlay
                state={overlay}
                message={overlayMsg}
                onDismiss={() => {
                    setOverlay(null);
                    setOverlayMsg(null);
                }}
            />

         
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">{metodos.length} método(s) registrado(s)</p>
                <button
                    onClick={() => setOpenCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Nuevo método
                </button>
            </div>

            
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                ID
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                País
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                                Tipo
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Título
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                                Número
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {metodos.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                                    No hay métodos registrados
                                </td>
                            </tr>
                        ) : (
                            metodos.map((m) => (
                                <tr key={m.id} className="hover:bg-blue-50/30 transition">
                                    <td className="py-3 px-4 font-medium text-gray-800">{m.id}</td>
                                    <td className="py-3 px-4 text-gray-700 font-medium">
                                        {m.currency_pair}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">
                                        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-800 font-semibold">
                                        {m.title}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                                        {m.number ?? (
                                            <span className="text-gray-400 italic text-xs">Es QR</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {/* Ver imagen */}
                                            <button
                                                onClick={() => window.open(m.image, "_blank")}
                                                title="Ver imagen"
                                                disabled={!m.image}
                                                className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ImageIcon size={18} />
                                            </button>

                                            {/* Editar */}
                                            <button
                                                onClick={() => handleEdit(m)}
                                                title="Editar"
                                                className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                            >
                                                <Pen size={18} />
                                            </button>

                                            {/* Eliminar */}
                                            <button
                                                onClick={() => handleDelete(m.id)}
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

           
            <MetodoModal
                isOpen={openCreate}
                onClose={() => setOpenCreate(false)}
                onSaved={onSaved}
            />

          
            <MetodoModal
                isOpen={openEdit}
                onClose={() => setOpenEdit(false)}
                onSaved={onSaved}
                metodo={selected}
            />
        </div>
    );
}
