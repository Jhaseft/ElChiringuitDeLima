import { useState, useCallback } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Search, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Phone, Mail } from "lucide-react";
import AdminOverlay from "../AdminOverlay";

// ─── Helpers ────────────────────────────────────────────────

const STATUS_CFG = {
    pendiente:  { label: "Pendiente",  bg: "bg-yellow-100", text: "text-yellow-700", Icon: Clock },
    completado: { label: "Completado", bg: "bg-green-100",  text: "text-green-700",  Icon: CheckCircle2 },
    cancelado:  { label: "Cancelado",  bg: "bg-gray-100",   text: "text-gray-500",   Icon: XCircle },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.pendiente;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <cfg.Icon size={12} />
            {cfg.label}
        </span>
    );
}

function Avatar({ user }) {
    const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || "?";
    return (
        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">{initials}</span>
        </div>
    );
}

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("es-PE", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── Fila expandible ────────────────────────────────────────

function CanjeRow({ canje, onUpdate }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [nota, setNota]         = useState(canje.notas ?? "");

    const cambiarEstado = async (nuevoStatus) => {
        if (!confirm(`¿Marcar este canje como "${STATUS_CFG[nuevoStatus]?.label}"?`)) return;
        setLoading(true);
        try {
            const res = await axios.post(
                `/admin/dashboard/canjes-tc/${canje.id}/status`,
                { status: nuevoStatus, notas: nota },
                { withCredentials: true }
            );
            onUpdate(res.data);
        } catch {
            alert("Error al actualizar el estado");
        } finally {
            setLoading(false);
        }
    };

    const user    = canje.user;
    const nombre  = user ? `${user.first_name} ${user.last_name}` : "Usuario eliminado";
    const prod    = canje.producto;
    const isPend  = canje.status === "pendiente";

    return (
        <>
            <tr
                className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${expanded ? "bg-blue-50/40" : ""}`}
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Avatar + nombre */}
                <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <div>
                            <p className="font-semibold text-gray-900 text-sm leading-tight">{nombre}</p>
                            <p className="text-gray-400 text-xs">{user?.email ?? "—"}</p>
                        </div>
                    </div>
                </td>

                {/* Producto */}
                <td className="py-3 px-4">
                    <div>
                        <p className="font-medium text-gray-800 text-sm">{prod?.nombre ?? "—"}</p>
                        {prod?.categoria && (
                            <p className="text-xs text-gray-400">{prod.categoria.nombre}</p>
                        )}
                    </div>
                </td>

                {/* Puntos */}
                <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                        {Number(canje.puntos_usados).toLocaleString()} pts
                    </span>
                </td>

                {/* Fecha */}
                <td className="py-3 px-4 text-gray-500 text-xs hidden md:table-cell whitespace-nowrap">
                    {formatDate(canje.created_at)}
                </td>

                {/* Estado */}
                <td className="py-3 px-4">
                    <StatusBadge status={canje.status} />
                </td>

                {/* Expandir */}
                <td className="py-3 px-4 text-gray-400">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </td>
            </tr>

            {/* Panel expandido */}
            {expanded && (
                <tr className="bg-blue-50/30 border-b border-blue-100">
                    <td colSpan={6} className="px-6 py-5">
                        <div className="flex flex-col lg:flex-row gap-6">

                            {/* Info del usuario */}
                            <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                                    Información del cliente
                                </p>
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar user={user} />
                                    <div>
                                        <p className="font-bold text-gray-900">{nombre}</p>
                                        <p className="text-xs text-gray-400">ID: {user?.id ?? "—"}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                                        {user?.email ?? "—"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="text-gray-400 flex-shrink-0" />
                                        {user?.phone ?? "—"}
                                    </div>
                                </div>
                                {canje.notas && (
                                    <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                                        <span className="font-semibold">Nota: </span>{canje.notas}
                                    </div>
                                )}
                            </div>

                            {/* Info del producto */}
                            <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                                    Producto canjeado
                                </p>
                                <div className="flex gap-3 items-start">
                                    {prod?.imagen_url ? (
                                        <img
                                            src={prod.imagen_url}
                                            alt={prod.nombre}
                                            className="w-16 h-16 rounded-xl object-cover border flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-yellow-600 font-bold text-xs text-center">TC</span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-900">{prod?.nombre ?? "—"}</p>
                                        {prod?.categoria && (
                                            <p className="text-xs text-gray-400 mb-1">{prod.categoria.nombre}</p>
                                        )}
                                        <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                            {Number(canje.puntos_usados).toLocaleString()} TC Puntos
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">{formatDate(canje.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                                    Acciones
                                </p>

                                <textarea
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Agregar nota (opcional)"
                                    rows={2}
                                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
                                />

                                <div className="flex flex-col gap-2">
                                    {isPend && (
                                        <button
                                            onClick={() => cambiarEstado("completado")}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60"
                                        >
                                            <CheckCircle2 size={16} />
                                            Marcar como entregado
                                        </button>
                                    )}
                                    {canje.status !== "cancelado" && (
                                        <button
                                            onClick={() => cambiarEstado("cancelado")}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60"
                                        >
                                            <XCircle size={16} />
                                            Cancelar canje
                                        </button>
                                    )}
                                    {canje.status === "cancelado" && (
                                        <button
                                            onClick={() => cambiarEstado("pendiente")}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center gap-2 border border-yellow-300 text-yellow-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-yellow-50 transition disabled:opacity-60"
                                        >
                                            <Clock size={16} />
                                            Reactivar canje
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Tabla principal ─────────────────────────────────────────

export default function CanjesTable({ canjes: initialCanjes, filters }) {
    const [canjes, setCanjes]   = useState(initialCanjes);
    const [search, setSearch]   = useState(filters.search ?? "");
    const [status, setStatus]   = useState(filters.status ?? "");
    const [overlay, setOverlay] = useState(null);

    const buscar = (e) => {
        e.preventDefault();
        router.get("/admin/dashboard/canjes-tc", { search, status }, {
            preserveScroll: true,
            onSuccess: (page) => setCanjes(page.props.canjes),
        });
    };

    const handleUpdate = (actualizado) => {
        setCanjes((prev) => ({
            ...prev,
            data: prev.data.map((c) => (c.id === actualizado.id ? actualizado : c)),
        }));
        setOverlay("success");
        setTimeout(() => setOverlay(null), 1800);
    };

    const irPagina = (url) => {
        if (!url) return;
        router.visit(url, {
            preserveScroll: true,
            onSuccess: (page) => setCanjes(page.props.canjes),
        });
    };

    return (
        <div>
            <AdminOverlay state={overlay} onDismiss={() => setOverlay(null)} />

            {/* Buscador y filtros */}
            <form onSubmit={buscar} className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, email o teléfono…"
                        className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                >
                    Buscar
                </button>
            </form>

            {/* Contador */}
            <p className="text-sm text-gray-500 mb-4">
                {canjes.total} canje(s) encontrado(s)
            </p>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Puntos</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                            <th className="py-3 px-4" />
                        </tr>
                    </thead>
                    <tbody>
                        {canjes.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                                    No se encontraron canjes
                                </td>
                            </tr>
                        ) : (
                            canjes.data.map((canje) => (
                                <CanjeRow key={canje.id} canje={canje} onUpdate={handleUpdate} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {canjes.last_page > 1 && (
                <div className="flex items-center justify-between mt-5">
                    <p className="text-xs text-gray-400">
                        Página {canjes.current_page} de {canjes.last_page}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => irPagina(canjes.prev_page_url)}
                            disabled={!canjes.prev_page_url}
                            className="px-3 py-1.5 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => irPagina(canjes.next_page_url)}
                            disabled={!canjes.next_page_url}
                            className="px-3 py-1.5 border rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
