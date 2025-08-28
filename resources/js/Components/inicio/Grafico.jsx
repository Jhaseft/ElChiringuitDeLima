import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-2xl shadow-lg flex flex-col gap-3">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-gray-800">
        Evolución de la moneda
      </h2>

      {loading && (
        <p className="text-center text-gray-500 text-sm sm:text-base">
          Cargando datos...
        </p>
      )}

      {!loading && (
        <div className="w-full h-56 sm:h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="colorCompra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorVenta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                }}
              />
              <Legend verticalAlign="top" height={36} />

              <Line
                type="monotone"
                dataKey="compra"
                stroke="url(#colorCompra)"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="venta"
                stroke="url(#colorVenta)"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
