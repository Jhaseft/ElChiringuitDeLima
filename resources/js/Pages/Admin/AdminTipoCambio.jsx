import { useState } from "react";

export default function AdminTipoCambio({ tipoCambio }) {
  const [compra, setCompra] = useState(tipoCambio?.compra || "");
  const [venta, setVenta] = useState(tipoCambio?.venta || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const token = document.querySelector('meta[name="csrf-token"]').content;

    try {
      const res = await fetch("/admin/tipo-cambio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
          "Accept": "application/json"
        },
        body: JSON.stringify({ compra, venta }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("Tipo de cambio actualizado ✅");
      } else {
        setMessage(data.message || "Error al actualizar ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error de conexión ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col items-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Panel de Tipo de Cambio</h1>

      {/* Tabla con tipo de cambio actual */}
      <div className="w-full max-w-lg overflow-x-auto mb-6">
        <table className="bg-white shadow-md rounded w-full min-w-[400px]">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Compra (actual)</th>
              <th className="p-2 text-left">Venta (actual)</th>
              <th className="p-2 text-left">Última actualización</th>
            </tr>
          </thead>
          <tbody>
            <tr className="odd:bg-gray-50">
              <td className="p-2">{tipoCambio?.compra}</td>
              <td className="p-2">{tipoCambio?.venta}</td>
              <td className="p-2">{tipoCambio?.fecha_actualizacion}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Formulario para actualizar */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <label className="flex flex-col">
          <span className="font-semibold mb-1">Actualizar Compra:</span>
          <input 
            type="number" 
            step="0.01"
            value={compra} 
            onChange={e => setCompra(e.target.value)} 
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold mb-1">Actualizar Venta:</span>
          <input 
            type="number" 
            step="0.01"
            value={venta} 
            onChange={e => setVenta(e.target.value)} 
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-500 text-white rounded p-2 mt-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Actualizando..." : "Actualizar Tipo de Cambio"}
        </button>

        {message && <p className="mt-2 text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
