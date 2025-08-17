import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Grafico({ setTasas }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener la hora actual en formato HH:MM
  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    function generarDatos() {
      const fakeData = Array.from({ length: 6 }).map((_, i) => ({
        time: getCurrentTime(),
        buy: Math.floor(Math.random() * 10 + 6),
        sale: Math.floor(Math.random() * 10 + 7),
      }));

      setData(fakeData);

      if (setTasas) {
        const last = fakeData[fakeData.length - 1];
        setTasas({ buy: last.buy, sale: last.sale });
      }

      setLoading(false);
    }

    // Generamos los datos al inicio
    generarDatos();

    // Actualizamos cada 5 segundos (5000 ms)
    const interval = setInterval(generarDatos, 5000);

    // Limpiar el intervalo al desmontar
    return () => clearInterval(interval);
  }, [setTasas]);

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow flex flex-col gap-3">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-center text-gray-800">
        📊 Evolución de la tasa de cambio
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="buy"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="sale"
                stroke="#f59e0b"
                strokeWidth={2}
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
