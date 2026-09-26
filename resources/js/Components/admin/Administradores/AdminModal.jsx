import { useState, useEffect } from "react";
import axios from "axios";
import { X, Upload } from "lucide-react";

const EMPTY = { username: "", email: "", password: "", role_id: "" };

export default function AdminModal({ isOpen, onClose, onSaved, onError, admin = null, roles }) {
    const isEdit = Boolean(admin);
    const [data, setData] = useState(EMPTY);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        setData(
            isEdit
                ? { username: admin.username ?? "", email: admin.email ?? "", password: "", role_id: admin.role_id ?? "" }
                : EMPTY
        );
        setErrors({});
    }, [isOpen, admin]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const url = isEdit
                ? `/admin/dashboard/administradores/admins/${admin.id}/update`
                : `/admin/dashboard/administradores/admins/store`;

            await axios.post(url, data, { withCredentials: true });
            onSaved(isEdit ? "Administrador actualizado" : "Administrador creado");
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
                if (err.response.data.message) onError(err.response.data.message);
            } else {
                onError("Error al guardar el administrador");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {isEdit ? "Editar administrador" : "Nuevo administrador"}
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
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Usuario</label>
                        <input
                            name="username"
                            value={data.username}
                            onChange={handleChange}
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleChange}
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Contrasena{" "}
                            {isEdit && (
                                <span className="text-gray-400 font-normal normal-case">(dejar vacio para no cambiarla)</span>
                            )}
                        </label>
                        <input
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={handleChange}
                            placeholder="Minimo 8 caracteres"
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rol</label>
                        <select
                            name="role_id"
                            value={data.role_id}
                            onChange={handleChange}
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">-- Seleccionar --</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                    {r.is_super ? " (acceso total)" : ""}
                                </option>
                            ))}
                        </select>
                        {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id[0]}</p>}
                    </div>

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
                                "Crear administrador"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
