import { useState, useCallback } from "react";
import AdminOverlay from "./AdminOverlay";

const GRUPO_LABELS = {
    transferencias: "Transferencias",
    limites: "Límites",
    general: "General",
};

export default function ConfiguracionForm({ configuracion }) {
    const [valores, setValores] = useState(() => {
        const init = {};
        configuracion.forEach((item) => {
            init[item.clave] = item.valor ?? "";
        });
        return init;
    });
    const [overlay, setOverlay] = useState(null);
    const [overlayMsg, setOverlayMsg] = useState(null);

    const handleDismiss = useCallback(() => {
        setOverlay(null);
        setOverlayMsg(null);
    }, []);

    const handleChange = (clave, value) => {
        setValores((prev) => ({ ...prev, [clave]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOverlay("loading");
        setOverlayMsg(null);
        const token = document.querySelector('meta[name="csrf-token"]').content;

        try {
            const res = await fetch("/admin/dashboard/configuracion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": token,
                    Accept: "application/json",
                },
                body: JSON.stringify(valores),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setOverlayMsg("Configuración guardada correctamente.");
                setOverlay("success");
            } else {
                const firstError =
                    data?.errors
                        ? Object.values(data.errors)[0]?.[0]
                        : data?.message;
                setOverlayMsg(firstError || "Error al guardar la configuración.");
                setOverlay("error");
            }
        } catch {
            setOverlayMsg("Error de conexión. Intente nuevamente.");
            setOverlay("error");
        }
    };

    const grupos = configuracion.reduce((acc, item) => {
        const g = item.grupo || "general";
        if (!acc[g]) acc[g] = [];
        acc[g].push(item);
        return acc;
    }, {});

    return (
        <div className="w-full">
            <AdminOverlay
                state={overlay}
                message={overlayMsg}
                autoDismiss={3000}
                onDismiss={handleDismiss}
            />

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {Object.entries(grupos).map(([grupo, items]) => (
                    <div key={grupo}>
                        <h3 className="text-lg font-semibold text-gray-600 border-b pb-2 mb-4">
                            {GRUPO_LABELS[grupo] ?? grupo}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <label key={item.clave} className="flex flex-col gap-1">
                                    <span className="font-medium text-gray-700">
                                        {item.etiqueta}
                                    </span>
                                    {item.descripcion && (
                                        <span className="text-xs text-gray-400">
                                            {item.descripcion}
                                        </span>
                                    )}
                                    <input
                                        type={
                                            item.tipo === "decimal" || item.tipo === "entero"
                                                ? "number"
                                                : "text"
                                        }
                                        step={item.tipo === "decimal" ? "0.01" : undefined}
                                        value={valores[item.clave]}
                                        onChange={(e) =>
                                            handleChange(item.clave, e.target.value)
                                        }
                                        className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={overlay === "loading"}
                        className="bg-blue-500 text-white rounded px-6 py-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}
