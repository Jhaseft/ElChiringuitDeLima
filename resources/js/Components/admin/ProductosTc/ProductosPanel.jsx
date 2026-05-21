import { useState } from "react";
import axios from "axios";
import { Pen, Trash2, ImageIcon, Plus, Coins } from "lucide-react";
import AdminOverlay from "../AdminOverlay";
import ProductoModal from "./ProductoModal";

export default function ProductosPanel({ categoria, onSaved }) {
    const [productos, setProductos] = useState(categoria.productos ?? []);
    const [overlay, setOverlay] = useState(null);
    const [overlayMsg, setOverlayMsg] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selected, setSelected] = useState(null);

    const dismiss = () => { setOverlay(null); setOverlayMsg(null); };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este producto?")) return;
        setOverlay("loading");
        try {
            await axios.delete(`/admin/dashboard/productos-tc/productos/${id}`, { withCredentials: true });
            const nuevos = productos.filter((p) => p.id !== id);
            setProductos(nuevos);
            onSaved({ ...categoria, productos: nuevos });
            setOverlayMsg("Producto eliminado");
            setOverlay("success");
        } catch {
            setOverlayMsg("Error al eliminar");
            setOverlay("error");
        }
    };

    const onCreated = (nuevo) => {
        setOpenCreate(false);
        const nuevos = [...productos, nuevo];
        setProductos(nuevos);
        onSaved({ ...categoria, productos: nuevos });
        setOverlay("success");
    };

    const onUpdated = (actualizado) => {
        setOpenEdit(false);
        const nuevos = productos.map((p) => (p.id === actualizado.id ? actualizado : p));
        setProductos(nuevos);
        onSaved({ ...categoria, productos: nuevos });
        setOverlay("success");
    };

    return (
        <div>
            <AdminOverlay state={overlay} message={overlayMsg} onDismiss={dismiss} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">{productos.length} producto(s)</p>
                <button
                    onClick={() => setOpenCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Nuevo producto
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Imagen</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Descripción</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Costo</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Stock</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                                    No hay productos en esta categoría. Agrega el primero.
                                </td>
                            </tr>
                        ) : (
                            productos.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition">
                                    <td className="py-3 px-4">
                                        {p.imagen_url ? (
                                            <img
                                                src={p.imagen_url}
                                                alt={p.nombre}
                                                className="w-12 h-12 object-cover rounded-lg border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <ImageIcon size={18} className="text-gray-300" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-gray-800">{p.nombre}</td>
                                    <td className="py-3 px-4 text-gray-500 hidden sm:table-cell max-w-xs truncate">
                                        {p.descripcion ?? <span className="italic text-gray-300">—</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                            <Coins size={12} />
                                            {Number(p.costo_puntos).toLocaleString()} pts
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                                        {p.stock !== null ? p.stock : <span className="italic text-gray-400 text-xs">Ilimitado</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${p.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {p.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSelected(p); setOpenEdit(true); }}
                                                title="Editar"
                                                className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                                            >
                                                <Pen size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
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

            <ProductoModal
                isOpen={openCreate}
                onClose={() => setOpenCreate(false)}
                onSaved={onCreated}
                categoriaId={categoria.id}
            />
            <ProductoModal
                isOpen={openEdit}
                onClose={() => setOpenEdit(false)}
                onSaved={onUpdated}
                categoriaId={categoria.id}
                producto={selected}
            />
        </div>
    );
}
