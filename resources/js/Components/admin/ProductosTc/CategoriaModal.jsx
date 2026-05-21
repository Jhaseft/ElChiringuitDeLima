import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, ImageIcon, Upload } from "lucide-react";

const EMPTY = { nombre: "", descripcion: "", activo: true, orden: 0 };

export default function CategoriaModal({ isOpen, onClose, onSaved, categoria = null }) {
    const isEdit = Boolean(categoria);
    const [data, setData] = useState(EMPTY);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const fileRef = useRef();

    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                setData({
                    nombre:      categoria.nombre ?? "",
                    descripcion: categoria.descripcion ?? "",
                    activo:      categoria.activo ?? true,
                    orden:       categoria.orden ?? 0,
                });
                setPreview(categoria.imagen_url ?? null);
            } else {
                setData(EMPTY);
                setPreview(null);
            }
            setImageFile(null);
            setErrors({});
        }
    }, [isOpen, categoria]);

    const handleChange = (e) => {
        const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setData({ ...data, [e.target.name]: val });
        setErrors({ ...errors, [e.target.name]: null });
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const form = new FormData();
        form.append("nombre",      data.nombre);
        form.append("descripcion", data.descripcion);
        form.append("activo",      data.activo ? 1 : 0);
        form.append("orden",       data.orden);
        if (imageFile) form.append("imagen", imageFile);

        try {
            const url = isEdit
                ? `/admin/dashboard/productos-tc/categorias/${categoria.id}/update`
                : `/admin/dashboard/productos-tc/categorias/store`;

            const res = await axios.post(url, form, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            onSaved(res.data);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEdit ? "Editar categoría" : "Nueva categoría"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre *</label>
                        <input
                            name="nombre"
                            value={data.nombre}
                            onChange={handleChange}
                            placeholder="Ej: OKTAVA X Transfer"
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={data.descripcion}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Descripción breve de la categoría"
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Orden</label>
                            <input
                                type="number"
                                name="orden"
                                value={data.orden}
                                onChange={handleChange}
                                min={0}
                                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={data.activo}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <span className="text-sm text-gray-700 font-medium">Activa</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Imagen promocional</label>
                        <div
                            onClick={() => fileRef.current.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
                        >
                            {preview ? (
                                <img src={preview} alt="preview" className="h-28 object-contain rounded-lg" />
                            ) : (
                                <>
                                    <ImageIcon size={28} className="text-gray-300 mb-2" />
                                    <span className="text-xs text-gray-400">Haz clic para subir imagen</span>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                        {errors.imagen && <p className="text-red-500 text-xs mt-1">{errors.imagen[0]}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 border rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Upload size={14} className="animate-bounce" /> Guardando…</> : isEdit ? "Guardar cambios" : "Crear categoría"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
