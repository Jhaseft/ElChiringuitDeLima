import { useState } from "react";
import axios from "axios";
import { Pen, Trash2, ImageIcon, Plus, ChevronRight } from "lucide-react";
import AdminOverlay from "../AdminOverlay";
import CategoriaModal from "./CategoriaModal";

export default function CategoriasPanel({ categorias, categoriaSeleccionada, onSelect, onSaved }) {
    const [overlay, setOverlay] = useState(null);
    const [overlayMsg, setOverlayMsg] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selected, setSelected] = useState(null);

    const dismiss = () => { setOverlay(null); setOverlayMsg(null); };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar esta categoría y todos sus productos?")) return;
        setOverlay("loading");
        try {
            await axios.delete(`/admin/dashboard/productos-tc/categorias/${id}`, { withCredentials: true });
            const nuevas = categorias.filter((c) => c.id !== id);
            onSaved(nuevas);
            setOverlayMsg("Categoría eliminada");
            setOverlay("success");
        } catch {
            setOverlayMsg("Error al eliminar");
            setOverlay("error");
        }
    };

    const handleEdit = (e, cat) => {
        e.stopPropagation();
        setSelected(cat);
        setOpenEdit(true);
    };

    const onCreated = (nueva) => {
        setOpenCreate(false);
        onSaved([...categorias, { ...nueva, productos: nueva.productos ?? [] }]);
        setOverlay("success");
    };

    const onUpdated = (actualizada) => {
        setOpenEdit(false);
        onSaved(categorias.map((c) => (c.id === actualizada.id ? actualizada : c)));
        setOverlay("success");
    };

    return (
        <div>
            <AdminOverlay state={overlay} message={overlayMsg} onDismiss={dismiss} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">{categorias.length} categoría(s)</p>
                <button
                    onClick={() => setOpenCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Nueva categoría
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Imagen</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Descripción</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Productos</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {categorias.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                                    No hay categorías. Crea la primera.
                                </td>
                            </tr>
                        ) : (
                            categorias.map((cat) => {
                                const activa = categoriaSeleccionada?.id === cat.id;
                                return (
                                    <tr
                                        key={cat.id}
                                        onClick={() => onSelect(cat)}
                                        className={`cursor-pointer transition ${activa ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                    >
                                        <td className="py-3 px-4">
                                            {cat.imagen_url ? (
                                                <img
                                                    src={cat.imagen_url}
                                                    alt={cat.nombre}
                                                    className="w-12 h-12 object-cover rounded-lg border"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <ImageIcon size={18} className="text-gray-300" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-gray-800">
                                            <div className="flex items-center gap-1">
                                                {cat.nombre}
                                                {activa && <ChevronRight size={14} className="text-blue-500" />}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 hidden sm:table-cell max-w-xs truncate">
                                            {cat.descripcion ?? <span className="italic text-gray-300">—</span>}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                {cat.productos?.length ?? 0}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cat.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {cat.activo ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleEdit(e, cat)}
                                                    title="Editar"
                                                    className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                                >
                                                    <Pen size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, cat.id)}
                                                    title="Eliminar"
                                                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <CategoriaModal isOpen={openCreate} onClose={() => setOpenCreate(false)} onSaved={onCreated} />
            <CategoriaModal isOpen={openEdit} onClose={() => setOpenEdit(false)} onSaved={onUpdated} categoria={selected} />
        </div>
    );
}
