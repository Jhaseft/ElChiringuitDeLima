import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLOR_COMPRA = "#3987e5";
const COLOR_VENTA = "#c98500";

function LeyendaPersonalizada({ payload }) {
  const etiquetas = { compra: "Compra", venta: "Venta" };
  return (
    <div className="flex items-center justify-center gap-5 pb-1">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-gray-300">
            {etiquetas[entry.value] ?? entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-[11px] font-medium text-gray-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.dataKey === "compra" ? "Compra" : "Venta"}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function Grafico({ setTasas }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/tipo-cambio/historial"); // tu endpoint que devuelve historial
        const json = await res.json();

        // Mapear los datos para Recharts
        const formattedData = json.map((item) => ({
          time: new Date(item.fecha_actualizacion).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          }),
          compra: Number(item.compra),
          venta: Number(item.venta),
        }));

        setData(formattedData);

        // Enviar última tasa al padre si se necesita
        if (setTasas && formattedData.length > 0) {
          const last = formattedData[formattedData.length - 1];
          setTasas({ compra: last.compra, venta: last.venta });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error al obtener historial:", err);
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000); // actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [setTasas]);

  return (
    <div className="w-full h-full p-5 bg-gray-800 rounded-2xl shadow-xl flex flex-col gap-2">
      <h2 className="text-base sm:text-lg font-bold text-center text-white">
        Evolución de la moneda
      </h2>

      {loading && (
        <p className="text-center text-gray-400 text-sm sm:text-base">
          Cargando datos...
        </p>
      )}

      {!loading && (
        <div className="w-full flex-1 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_COMPRA} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLOR_COMPRA} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVenta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_VENTA} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLOR_VENTA} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 6" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={{ stroke: "#4b5563" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                domain={["auto", "auto"]}
                width={40}
              />
              <Tooltip content={<TooltipPersonalizado />} cursor={{ stroke: "#4b5563", strokeWidth: 1 }} />
              <Legend content={<LeyendaPersonalizada />} verticalAlign="top" />

              <Area
                type="monotone"
                dataKey="compra"
                stroke={COLOR_COMPRA}
                strokeWidth={2.5}
                fill="url(#colorCompra)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#1f2937" }}
              />
              <Area
                type="monotone"
                dataKey="venta"
                stroke={COLOR_VENTA}
                strokeWidth={2.5}
                fill="url(#colorVenta)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#1f2937" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
