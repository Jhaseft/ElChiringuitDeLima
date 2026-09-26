import { useState, useEffect } from "react";
import axios from "axios";
import { X, Upload } from "lucide-react";

export default function RoleModal({ isOpen, onClose, onSaved, onError, role = null, modules }) {
    const isEdit = Boolean(role);
    const [name, setName] = useState("");
    const [isSuper, setIsSuper] = useState(false);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        setName(role?.name ?? "");
        setIsSuper(Boolean(role?.is_super));
        setSelected(role?.permissions ?? []);
        setErrors({});
    }, [isOpen, role]);

    const togglePermission = (key) => {
        setSelected((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const url = isEdit
                ? `/admin/dashboard/administradores/roles/${role.id}/update`
                : `/admin/dashboard/administradores/roles/store`;

            await axios.post(
                url,
                { name, is_super: isSuper, permissions: isSuper ? [] : selected },
                { withCredentials: true }
            );

            onSaved(isEdit ? "Rol actualizado" : "Rol creado");
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
                if (err.response.data.message) onError(err.response.data.message);
            } else {
                onError("Error al guardar el rol");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEdit ? "Editar rol" : "Nuevo rol"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Nombre del rol
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Encargado de transferencias"
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    <label className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isSuper}
                            onChange={(e) => setIsSuper(e.target.checked)}
                            className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                            <span className="font-semibold">Acceso total (Super Admin)</span>
                            <span className="block text-xs text-gray-500">
                                Ve todo el panel y gestiona roles y administradores.
                            </span>
                        </span>
                    </label>

                    {!isSuper && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                                Pestanas permitidas
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(modules).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                                            selected.includes(key)
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(key)}
                                            onChange={() => togglePermission(key)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

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
                            ) : isEdit ? (
                                "Guardar cambios"
                            ) : (
                                "Crear rol"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
