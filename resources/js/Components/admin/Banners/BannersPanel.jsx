import { useState } from "react";
import axios from "axios";
import { Pen, Trash2, ImageIcon, Plus } from "lucide-react";
import AdminOverlay from "../AdminOverlay";
import BannerModal from "./BannerModal";

export default function BannersPanel({ banners, onChange }) {
    const [overlay, setOverlay] = useState(null);
    const [overlayMsg, setOverlayMsg] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selected, setSelected] = useState(null);

    const dismiss = () => { setOverlay(null); setOverlayMsg(null); };

    const sortByOrder = (list) =>
        [...list].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este banner? Esta acción no se puede deshacer.")) return;
        setOverlay("loading");
        try {
            await axios.delete(`/admin/dashboard/banners/${id}`, { withCredentials: true });
            onChange(banners.filter((b) => b.id !== id));
            setOverlayMsg("Banner eliminado");
            setOverlay("success");
        } catch {
            setOverlayMsg("Error al eliminar");
            setOverlay("error");
        }
    };

    const onCreated = (nuevo) => {
        setOpenCreate(false);
        onChange(sortByOrder([...banners, nuevo]));
        setOverlay("success");
    };

    const onUpdated = (actualizado) => {
        setOpenEdit(false);
        onChange(sortByOrder(banners.map((b) => (b.id === actualizado.id ? actualizado : b))));
        setOverlay("success");
    };

    return (
        <div>
            <AdminOverlay state={overlay} message={overlayMsg} onDismiss={dismiss} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">{banners.length} banner(s)</p>
                <button
                    onClick={() => setOpenCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Nuevo banner
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Imagen</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Orden</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-gray-400 text-sm">
                                    No hay banners. Crea el primero.
                                </td>
                            </tr>
                        ) : (
                            banners.map((banner) => (
                                <tr key={banner.id} className="hover:bg-gray-50 transition">
                                    <td className="py-3 px-4">
                                        {banner.image_url ? (
                                            <img
                                                src={banner.image_url}
                                                alt="Banner"
                                                className="w-28 h-12 object-cover rounded-lg border"
                                            />
                                        ) : (
                                            <div className="w-28 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <ImageIcon size={18} className="text-gray-300" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono">
                                            #{banner.sort_order}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {banner.is_active ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSelected(banner); setOpenEdit(true); }}
                                                title="Editar"
                                                className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                            >
                                                <Pen size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                title="Eliminar"
                                                className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <BannerModal isOpen={openCreate} onClose={() => setOpenCreate(false)} onSaved={onCreated} />
            <BannerModal isOpen={openEdit} onClose={() => setOpenEdit(false)} onSaved={onUpdated} banner={selected} />
        </div>
    );
}
