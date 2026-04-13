import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Upload, ImageIcon } from "lucide-react";

const EMPTY = { currency_pair: "", type: "", title: "", number: "" };

export default function MetodoModal({ isOpen, onClose, onSaved, metodo = null }) {
    const isEdit = Boolean(metodo);
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
                    currency_pair: metodo.currency_pair ?? "",
                    type: metodo.type ?? "",
                    title: metodo.title ?? "",
                    number: metodo.number ?? "",
                });
                setPreview(metodo.image ?? null);
            } else {
                setData(EMPTY);
                setPreview(null);
            }
            setImageFile(null);
            setErrors({});
        }
    }, [isOpen, metodo]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
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
        form.append("currency_pair", data.currency_pair);
        form.append("type", data.type);
        form.append("title", data.title);
        form.append("number", data.number);
        if (imageFile) form.append("image", imageFile);

        try {
            const url = isEdit
                ? `/admin/dashboard/metodos/${metodo.id}/update`
                : `/admin/dashboard/metodos/store`;

            await axios.post(url, form, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            onSaved();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            } else {
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEdit ? "Editar Método" : "Nuevo Método"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Dirección del par
                        </label>
                        <select
                            name="currency_pair"
                            value={data.currency_pair}
                            onChange={handleChange}
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">-- Seleccionar --</option>
                            <option value="BOBtoPEN">BOB → PEN (Bolivia a Perú)</option>
                            <option value="PENtoBOB">PEN → BOB (Perú a Bolivia)</option>
                        </select>
                        {errors.currency_pair && (
                            <p className="text-red-500 text-xs mt-1">{errors.currency_pair[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Tipo
                        </label>
                        <input
                            name="type"
                            value={data.type}
                            onChange={handleChange}
                            placeholder="Ej: BANK, QR, CASH"
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.type && (
                            <p className="text-red-500 text-xs mt-1">{errors.type[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Título
                        </label>
                        <input
                            name="title"
                            value={data.title}
                            onChange={handleChange}
                            placeholder="Ej: BCP, Yape, QR Tigo"
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Número / Cuenta <span className="text-gray-400 font-normal normal-case">(opcional para QR)</span>
                        </label>
                        <input
                            name="number"
                            value={data.number}
                            onChange={handleChange}
                            placeholder="Número de cuenta o dejar vacío"
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Imagen */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Imagen / QR
                        </label>
                        <div
                            onClick={() => fileRef.current.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className="h-24 object-contain rounded-lg"
                                />
                            ) : (
                                <>
                                    <ImageIcon size={28} className="text-gray-300 mb-2" />
                                    <span className="text-xs text-gray-400">
                                        Haz clic para subir imagen
                                    </span>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImage}
                        />
                        {errors.image && (
                            <p className="text-red-500 text-xs mt-1">{errors.image[0]}</p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Upload size={14} className="animate-bounce" />
                                    Guardando…
                                </>
                            ) : (
                                isEdit ? "Guardar cambios" : "Crear método"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
