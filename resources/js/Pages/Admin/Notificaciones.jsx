import AdminLayout from "@/Layouts/admin/AdminLayout";
import { useForm, usePage } from "@inertiajs/react";
import { Bell, Send } from "lucide-react";

export default function Notificaciones() {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        body: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/admin/dashboard/notificaciones/send", {
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto">

                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-500 p-3 rounded-xl">
                        <Bell size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
                        <p className="text-gray-500 text-sm">Envía una alerta masiva a todos los usuarios de la app</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Título
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData("title", e.target.value)}
                                placeholder="Ej: ¡Nueva promoción disponible!"
                                maxLength={100}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-1 text-right">{data.title.length}/100</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Mensaje
                            </label>
                            <textarea
                                value={data.body}
                                onChange={(e) => setData("body", e.target.value)}
                                placeholder="Ej: Aprovecha el nuevo tipo de cambio especial por tiempo limitado."
                                maxLength={500}
                                rows={4}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                            />
                            {errors.body && (
                                <p className="text-red-500 text-xs mt-1">{errors.body}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-1 text-right">{data.body.length}/500</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
                            <strong>Nota:</strong> Esta notificación se enviará a todos los usuarios que tengan la app instalada y hayan concedido permisos de notificaciones.
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !data.title || !data.body}
                            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition"
                        >
                            <Send size={18} />
                            {processing ? "Enviando..." : "Enviar a todos los usuarios"}
                        </button>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
