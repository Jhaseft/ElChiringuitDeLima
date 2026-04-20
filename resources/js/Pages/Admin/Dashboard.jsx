import AdminLayout from "@/Layouts/admin/AdminLayout";
import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle, Clock, XCircle } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";

const fmt = (n) =>
    Number(n || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const diff = (curr, prev) => {
    const d = (curr || 0) - (prev || 0);
    if (d === 0) return { text: "igual que ayer", color: "text-gray-500" };
    if (d > 0) return { text: `+${fmt(d)} vs ayer`, color: "text-emerald-600" };
    return { text: `${fmt(d)} vs ayer`, color: "text-rose-600" };
};

const Card = ({ label, amount, currency, subtitle, color, icon: Icon, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
    >
        <div className="flex items-start justify-between mb-3 gap-2">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 leading-tight">{label}</span>
            <div className={`p-1.5 sm:p-2 rounded-lg ${color} shrink-0`}>
                <Icon size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-gray-800 break-words">
            <span className="text-xs sm:text-sm font-semibold text-gray-400 mr-1">{currency}</span>
            {amount}
        </div>
        {subtitle && <div className={`text-[11px] sm:text-xs mt-2 font-medium ${subtitle.color}`}>{subtitle.text}</div>}
    </motion.div>
);

const Row = ({ label, value, muted }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-bold ${muted ? "text-gray-500" : "text-gray-800"}`}>{value}</span>
    </div>
);

export default function Dashboard({ metrics }) {
    const m = metrics || {};
    const hoy = m.hoy || {};
    const ayer = m.ayer || {};
    const semana = m.semana || {};
    const mes = m.mes || {};
    const estados = m.estados || {};
    const serie = m.serie || [];
    const tc = m.tipoCambio;

    const serieFmt = serie.map((s) => ({
        fecha: new Date(s.fecha + "T00:00:00").toLocaleDateString("es-PE", {
            day: "2-digit", month: "short",
        }),
        "BOB recibido": s.bob_in,
        "PEN recibido": s.pen_in,
    }));

    return (
        <AdminLayout>
            <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800">
                            Bienvenido, <span className="text-blue-500">Admin</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {new Date().toLocaleDateString("es-PE", {
                                weekday: "long", day: "numeric", month: "long", year: "numeric",
                            })}
                        </p>
                    </div>
                    {tc && (
                        <div className="grid grid-cols-2 sm:flex gap-2">
                            <div className="bg-white rounded-xl px-3 sm:px-4 py-2 border border-gray-100 shadow-sm">
                                <div className="text-[10px] uppercase text-gray-500 font-semibold">Tipo cambio compra</div>
                                <div className="text-sm sm:text-base font-bold text-emerald-600">{fmt(tc.compra)}</div>
                            </div>
                            <div className="bg-white rounded-xl px-3 sm:px-4 py-2 border border-gray-100 shadow-sm">
                                <div className="text-[10px] uppercase text-gray-500 font-semibold">Tipo cambio venta</div>
                                <div className="text-sm sm:text-base font-bold text-rose-600">{fmt(tc.venta)}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-700 mb-3">Hoy</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Card
                            label="BOB recibido"
                            currency="Bs"
                            amount={fmt(hoy.bob_in)}
                            subtitle={diff(hoy.bob_in, ayer.bob_in)}
                            color="bg-emerald-500"
                            icon={ArrowDownCircle}
                            delay={0}
                        />
                        <Card
                            label="PEN recibido"
                            currency="S/"
                            amount={fmt(hoy.pen_in)}
                            subtitle={diff(hoy.pen_in, ayer.pen_in)}
                            color="bg-emerald-500"
                            icon={ArrowDownCircle}
                            delay={0.05}
                        />
                        <Card
                            label="BOB entregado"
                            currency="Bs"
                            amount={fmt(hoy.bob_out)}
                            subtitle={diff(hoy.bob_out, ayer.bob_out)}
                            color="bg-rose-500"
                            icon={ArrowUpCircle}
                            delay={0.1}
                        />
                        <Card
                            label="PEN entregado"
                            currency="S/"
                            amount={fmt(hoy.pen_out)}
                            subtitle={diff(hoy.pen_out, ayer.pen_out)}
                            color="bg-rose-500"
                            icon={ArrowUpCircle}
                            delay={0.15}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base">Esta semana</h3>
                            <span className="text-xs text-gray-500">{semana.ops || 0} operaciones</span>
                        </div>
                        <Row label="BOB recibido" value={`Bs ${fmt(semana.bob_in)}`} />
                        <Row label="PEN recibido" value={`S/ ${fmt(semana.pen_in)}`} />
                        <Row label="BOB entregado" value={`Bs ${fmt(semana.bob_out)}`} muted />
                        <Row label="PEN entregado" value={`S/ ${fmt(semana.pen_out)}`} muted />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base">Este mes</h3>
                            <span className="text-xs text-gray-500">{mes.ops || 0} operaciones</span>
                        </div>
                        <Row label="BOB recibido" value={`Bs ${fmt(mes.bob_in)}`} />
                        <Row label="PEN recibido" value={`S/ ${fmt(mes.pen_in)}`} />
                        <Row label="BOB entregado" value={`Bs ${fmt(mes.bob_out)}`} muted />
                        <Row label="PEN entregado" value={`S/ ${fmt(mes.pen_out)}`} muted />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-5"
                >
                    <h3 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Ingresos diarios · últimos 14 días</h3>
                    <ResponsiveContainer width="100%" height={220} className="sm:!h-[260px]">
                        <LineChart data={serieFmt} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} width={45} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                                formatter={(v) => fmt(v)}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line type="monotone" dataKey="BOB recibido" stroke="#10b981" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="PEN recibido" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500 shrink-0">
                            <Clock size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-gray-500 uppercase font-semibold">Pendientes</div>
                            <div className="text-xl sm:text-2xl font-extrabold text-gray-800">{estados.pending || 0}</div>
                            <div className="text-[11px] text-gray-400">esperando revisión</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 rounded-xl bg-rose-500 shrink-0">
                            <XCircle size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-gray-500 uppercase font-semibold">Rechazadas</div>
                            <div className="text-xl sm:text-2xl font-extrabold text-gray-800">{estados.rejected || 0}</div>
                            <div className="text-[11px] text-gray-400">últimos 30 días</div>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
