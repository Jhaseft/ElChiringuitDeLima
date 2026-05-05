import { useState } from "react";
import axios from "axios";
import AdminLayout from "@/Layouts/admin/AdminLayout";
import {
    FileSpreadsheet,
    Search,
    TrendingUp,
    TrendingDown,
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
    RefreshCw,
} from "lucide-react";

const fmt = (n) =>
    Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Reportes() {
    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = hoy.slice(0, 8) + "01";

    const [form, setForm] = useState({
        fecha_inicio: inicioMes,
        fecha_fin: hoy,
        compra: "",
        venta: "",
    });
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);
    const [datos, setDatos] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrores({ ...errores, [e.target.name]: null });
    };

    const validar = () => {
        const e = {};
        if (!form.fecha_inicio) e.fecha_inicio = "Requerido";
        if (!form.fecha_fin) e.fecha_fin = "Requerido";
        if (form.fecha_fin < form.fecha_inicio) e.fecha_fin = "Debe ser mayor o igual a fecha inicio";
        if (!form.compra || isNaN(form.compra) || Number(form.compra) <= 0)
            e.compra = "Ingresa la tasa de compra (ej: 2.77)";
        if (!form.venta || isNaN(form.venta) || Number(form.venta) <= 0)
            e.venta = "Ingresa la tasa de venta (ej: 2.84)";
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const previsualizar = async () => {
        if (!validar()) return;
        setCargando(true);
        try {
            const { data } = await axios.get("/admin/dashboard/reportes/datos", { params: form });
            setDatos(data);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrores(err.response.data.errors || {});
            }
        } finally {
            setCargando(false);
        }
    };

    const descargarExcel = () => {
        if (!validar()) return;
        const params = new URLSearchParams(form).toString();
        window.open(`/admin/dashboard/reportes/excel?${params}`, "_blank");
    };

    const utilidadColor = datos
        ? datos.totales.utilidad >= 0 ? "text-emerald-600" : "text-red-600"
        : "";

    return (
        <AdminLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-6">

                {/* Encabezado */}
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-blue-700" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Reporte de Utilidad</h1>
                        <p className="text-sm text-gray-500">
                            Flujos BOB / PEN y ganancia por spread de tipo de cambio
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Parámetros del reporte
                    </h2>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Fecha inicio" icon={<Calendar size={13} />} error={errores.fecha_inicio}>
                            <input
                                type="date"
                                name="fecha_inicio"
                                value={form.fecha_inicio}
                                onChange={handleChange}
                                className={inputCls(errores.fecha_inicio)}
                            />
                        </Field>
                        <Field label="Fecha fin" icon={<Calendar size={13} />} error={errores.fecha_fin}>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={form.fecha_fin}
                                onChange={handleChange}
                                className={inputCls(errores.fecha_fin)}
                            />
                        </Field>
                    </div>

                    {/* Tasas */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                            Mi tipo de cambio — BOB por cada S/ 1
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                label="Tasa de COMPRA (clientes te dan BOB)"
                                error={errores.compra}
                                hint="Ej: 2.77  → das 1 PEN y recibes 2.77 BOB"
                            >
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                        BOB/PEN
                                    </span>
                                    <input
                                        type="number"
                                        name="compra"
                                        value={form.compra}
                                        onChange={handleChange}
                                        step="0.0001"
                                        min="0.0001"
                                        placeholder="2.7700"
                                        className={`${inputCls(errores.compra)} pl-20`}
                                    />
                                </div>
                            </Field>
                            <Field
                                label="Tasa de VENTA (clientes te dan PEN)"
                                error={errores.venta}
                                hint="Ej: 2.84  → recibes 1 PEN y das 2.84 BOB"
                            >
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                        BOB/PEN
                                    </span>
                                    <input
                                        type="number"
                                        name="venta"
                                        value={form.venta}
                                        onChange={handleChange}
                                        step="0.0001"
                                        min="0.0001"
                                        placeholder="2.8400"
                                        className={`${inputCls(errores.venta)} pl-20`}
                                    />
                                </div>
                            </Field>
                        </div>

                        {/* Explicación viva */}
                        {form.compra && form.venta && !isNaN(form.compra) && !isNaN(form.venta) && (
                            <div className="text-xs text-blue-600 bg-white rounded-lg border border-blue-200 px-3 py-2 space-y-1">
                                <p>
                                    <strong>BOBtoPEN:</strong> por cada 100 BOB que recibes, pagas{" "}
                                    <strong>S/ {fmt(100 / Number(form.compra))}</strong> al destinatario en Perú.
                                    Tu ganancia viene de que cobras a la tasa compra ({form.compra}) y operas al mercado.
                                </p>
                                <p>
                                    <strong>PENtoBOB:</strong> por cada S/ 100 que recibes, envías{" "}
                                    <strong>BOB {fmt(100 * Number(form.venta))}</strong> al destinatario en Bolivia.
                                </p>
                                <p className="font-semibold">
                                    Spread: {fmt(Number(form.venta) - Number(form.compra))} BOB por cada PEN transaccionado.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            onClick={previsualizar}
                            disabled={cargando}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                        >
                            {cargando
                                ? <RefreshCw size={15} className="animate-spin" />
                                : <Search size={15} />}
                            {cargando ? "Calculando..." : "Previsualizar"}
                        </button>

                        {datos && (
                            <button
                                onClick={descargarExcel}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                            >
                                <FileSpreadsheet size={15} />
                                Descargar Excel
                            </button>
                        )}
                    </div>
                </div>

                {/* Resultados */}
                {datos && (
                    <>
                        {/* Tarjetas resumen */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            <SummaryCard
                                label="BOB que entraron"
                                value={`BOB ${fmt(datos.totales.bob_entran)}`}
                                icon={<ArrowDownCircle size={20} className="text-emerald-500" />}
                                color="bg-emerald-50 border-emerald-200"
                            />
                            <SummaryCard
                                label="BOB que salieron"
                                value={`BOB ${fmt(datos.totales.bob_salen)}`}
                                icon={<ArrowUpCircle size={20} className="text-red-400" />}
                                color="bg-red-50 border-red-200"
                            />
                            <SummaryCard
                                label="PEN que entraron"
                                value={`S/ ${fmt(datos.totales.pen_entran)}`}
                                icon={<ArrowDownCircle size={20} className="text-emerald-500" />}
                                color="bg-emerald-50 border-emerald-200"
                            />
                            <SummaryCard
                                label="PEN que salieron"
                                value={`S/ ${fmt(datos.totales.pen_salen)}`}
                                icon={<ArrowUpCircle size={20} className="text-red-400" />}
                                color="bg-red-50 border-red-200"
                            />
                            <SummaryCard
                                label="UTILIDAD TOTAL"
                                value={`S/ ${fmt(datos.totales.utilidad)}`}
                                icon={
                                    datos.totales.utilidad >= 0
                                        ? <TrendingUp size={20} className="text-emerald-600" />
                                        : <TrendingDown size={20} className="text-red-600" />
                                }
                                color={datos.totales.utilidad >= 0
                                    ? "bg-yellow-50 border-yellow-300"
                                    : "bg-red-50 border-red-300"}
                                valueClass={`font-bold text-base ${utilidadColor}`}
                            />
                        </div>

                        {/* Tabla detalle */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-700">Detalle por día</h2>
                                <span className="text-xs text-gray-400">
                                    {datos.totales.total_ops} operación(es) completada(s)
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-800 text-white">
                                            <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                            <th className="px-4 py-3 text-right font-medium">BOB ↓ Entran</th>
                                            <th className="px-4 py-3 text-right font-medium">BOB ↑ Salen</th>
                                            <th className="px-4 py-3 text-right font-medium">PEN ↓ Entran</th>
                                            <th className="px-4 py-3 text-right font-medium">PEN ↑ Salen</th>
                                            <th className="px-4 py-3 text-right font-medium">Utilidad (PEN)</th>
                                            <th className="px-4 py-3 text-center font-medium">Ops.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datos.detalle.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-10 text-gray-400">
                                                    Sin operaciones completadas en ese rango.
                                                </td>
                                            </tr>
                                        )}
                                        {datos.detalle.map((fila, i) => (
                                            <tr key={fila.fecha} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                <td className="px-4 py-2.5 font-medium text-gray-700">{fila.fecha}</td>
                                                <td className="px-4 py-2.5 text-right text-emerald-700">{fmt(fila.bob_entran)}</td>
                                                <td className="px-4 py-2.5 text-right text-red-600">{fmt(fila.bob_salen)}</td>
                                                <td className="px-4 py-2.5 text-right text-emerald-700">{fmt(fila.pen_entran)}</td>
                                                <td className="px-4 py-2.5 text-right text-red-600">{fmt(fila.pen_salen)}</td>
                                                <td className={`px-4 py-2.5 text-right font-semibold ${fila.utilidad >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                                    S/ {fmt(fila.utilidad)}
                                                </td>
                                                <td className="px-4 py-2.5 text-center text-gray-500">{fila.total_ops}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {datos.detalle.length > 0 && (
                                        <tfoot>
                                            <tr className="bg-yellow-50 border-t-2 border-yellow-300 font-bold">
                                                <td className="px-4 py-3 text-gray-700">TOTALES</td>
                                                <td className="px-4 py-3 text-right text-emerald-700">{fmt(datos.totales.bob_entran)}</td>
                                                <td className="px-4 py-3 text-right text-red-600">{fmt(datos.totales.bob_salen)}</td>
                                                <td className="px-4 py-3 text-right text-emerald-700">{fmt(datos.totales.pen_entran)}</td>
                                                <td className="px-4 py-3 text-right text-red-600">{fmt(datos.totales.pen_salen)}</td>
                                                <td className={`px-4 py-3 text-right text-base ${utilidadColor}`}>
                                                    S/ {fmt(datos.totales.utilidad)}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600">{datos.totales.total_ops}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Nota fórmula */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-xs text-blue-700 space-y-1.5">
                            <p className="font-semibold">¿Cómo se calcula la utilidad?</p>
                            <p>
                                <strong>BOBtoPEN</strong> (cliente da BOB, recibes PEN):
                                Utilidad = (BOB_recibidos ÷ tasa_compra) − PEN_enviados
                            </p>
                            <p>
                                <strong>PENtoBOB</strong> (cliente da PEN, envías BOB):
                                Utilidad = PEN_recibidos − (BOB_enviados ÷ tasa_venta)
                            </p>
                            <p className="text-blue-500">
                                La ganancia viene del spread: al cobrar compra y venta distintas,
                                cada PEN transaccionado genera {
                                    form.compra && form.venta && !isNaN(form.compra) && !isNaN(form.venta)
                                        ? `BOB ${fmt(Number(form.venta) - Number(form.compra))} de ganancia`
                                        : "un margen"
                                } en BOB.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

const inputCls = (err) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        err ? "border-red-400" : "border-gray-200"
    }`;

function Field({ label, icon, hint, error, children }) {
    return (
        <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">
                {icon && <span className="inline mr-1">{icon}</span>}
                {label}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SummaryCard({ label, value, icon, color, valueClass }) {
    return (
        <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${color}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">{label}</span>
                {icon}
            </div>
            <p className={`text-sm font-semibold text-gray-800 ${valueClass || ""}`}>{value}</p>
        </div>
    );
}
