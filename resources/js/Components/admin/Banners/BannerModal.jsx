import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, ImageIcon, Upload } from "lucide-react";

const EMPTY = { sort_order: 0, is_active: true };

export default function BannerModal({ isOpen, onClose, onSaved, banner = null }) {
    const isEdit = Boolean(banner);
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
                    sort_order: banner.sort_order ?? 0,
                    is_active:  banner.is_active ?? true,
                });
                setPreview(banner.image_url ?? null);
            } else {
                setData(EMPTY);
                setPreview(null);
            }
            setImageFile(null);
            setErrors({});
        }
    }, [isOpen, banner]);

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
        setErrors({ ...errors, imagen: null });
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!isEdit && !imageFile) {
            setErrors({ imagen: ["Sube una imagen para el banner."] });
            return;
        }

        setLoading(true);
        setErrors({});

        const form = new FormData();
        form.append("sort_order", data.sort_order);
        form.append("is_active", data.is_active ? 1 : 0);
        if (imageFile) form.append("imagen", imageFile);

        try {
            const url = isEdit
                ? `/admin/dashboard/banners/${banner.id}/update`
                : `/admin/dashboard/banners/store`;

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
                        {isEdit ? "Editar banner" : "Nuevo banner"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Imagen *</label>
                        <div
                            onClick={() => fileRef.current.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
                        >
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full max-h-40 object-contain rounded-lg" />
                            ) : (
                                <>
                                    <ImageIcon size={28} className="text-gray-300 mb-2" />
                                    <span className="text-xs text-gray-400">Haz clic para subir imagen</span>
                                </>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">Ideal horizontal ~2.6:1 (ej. 1080×415 px).</p>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                        {errors.imagen && <p className="text-red-500 text-xs mt-1">{errors.imagen[0]}</p>}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Orden</label>
                            <input
                                type="number"
                                name="sort_order"
                                value={data.sort_order}
                                onChange={handleChange}
                                min={0}
                                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">0 aparece primero.</p>
                        </div>
                        <div className="flex items-start pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <span className="text-sm text-gray-700 font-medium">Activo</span>
                            </label>
                        </div>
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
                            {loading ? <><Upload size={14} className="animate-bounce" /> Guardando…</> : isEdit ? "Guardar cambios" : "Crear banner"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
