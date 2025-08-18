import { useEffect, useState } from "react";
import axios from "axios";
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

  // Formato hora HH:MM
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/tasas");
        const value = res.data.data.BOB.value;

        // Compra/Venta simulados
        const compra = parseFloat(value).toFixed(2);
        const venta = (parseFloat(value) + 0.02).toFixed(2);

        const newPoint = {
          time: getCurrentTime(),
          compra: Number(compra),
          venta: Number(venta),
        };

        setData((prev) => [...prev.slice(-10), newPoint]);

        if (setTasas) {
          setTasas({ compra: Number(compra), venta: Number(venta) });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error al obtener tasas:", err);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [setTasas]);

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow-lg flex flex-col gap-3">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-gray-800">
        📈 Evolución de la tasa PEN → BOB
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
