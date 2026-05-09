import { useState } from "react";
import AdminLayout from "@/Layouts/admin/AdminLayout";
import { FileSpreadsheet, Calendar, Archive } from "lucide-react";

export default function Reportes() {
    const hoy = new Date().toISOString().slice(0, 10);
    const inicioMes = hoy.slice(0, 8) + "01";

    const [form, setForm] = useState({ fecha_inicio: inicioMes, fecha_fin: hoy });
    const [errores, setErrores] = useState({});

    const validar = () => {
        const e = {};
        if (!form.fecha_inicio) e.fecha_inicio = "Requerido";
        if (!form.fecha_fin) e.fecha_fin = "Requerido";
        if (form.fecha_fin < form.fecha_inicio) e.fecha_fin = "Debe ser mayor o igual a la fecha inicio";
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const descargar = (params) => {
        window.open(`/admin/dashboard/reportes/excel?${new URLSearchParams(params)}`, "_blank");
    };

    const descargarRango = () => {
        if (!validar()) return;
        descargar(form);
    };

    const cierreCaja = () => {
        descargar({ fecha_inicio: hoy, fecha_fin: hoy });
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-2xl mx-auto space-y-6">

                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="text-blue-700" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
                        <p className="text-sm text-gray-500">Genera el reporte de operaciones en Excel</p>
                    </div>
                </div>

                {/* Rango de fechas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Rango de fechas
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                                <Calendar size={13} /> Fecha inicio
                            </label>
                            <input
                                type="date"
                                value={form.fecha_inicio}
                                onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errores.fecha_inicio ? "border-red-400" : "border-gray-200"}`}
                            />
                            {errores.fecha_inicio && <p className="text-xs text-red-500">{errores.fecha_inicio}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                                <Calendar size={13} /> Fecha fin
                            </label>
                            <input
                                type="date"
                                value={form.fecha_fin}
                                onChange={e => setForm({ ...form, fecha_fin: e.target.value })}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errores.fecha_fin ? "border-red-400" : "border-gray-200"}`}
                            />
                            {errores.fecha_fin && <p className="text-xs text-red-500">{errores.fecha_fin}</p>}
                        </div>
                    </div>

                    <button
                        onClick={descargarRango}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                    >
                        <FileSpreadsheet size={15} />
                        Descargar Excel
                    </button>
                </div>

                {/* Cierre de caja */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-gray-800">Cierre de Caja</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Genera el reporte de hoy ({hoy})
                        </p>
                    </div>
                    <button
                        onClick={cierreCaja}
                        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                    >
                        <Archive size={15} />
                        Cierre de Caja
                    </button>
                </div>

            </div>
        </AdminLayout>
    );
}
