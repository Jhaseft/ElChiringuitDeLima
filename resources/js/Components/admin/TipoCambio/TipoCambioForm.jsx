import { useState, useCallback } from "react";
import AdminOverlay from "../AdminOverlay";

export default function TipoCambioForm({ tipoCambio, pips_compra, pips_venta }) {
  const [compra, setCompra] = useState(tipoCambio?.compra || "");
  const [venta, setVenta] = useState(tipoCambio?.venta || "");
  const [pipsCompra, setPipsCompra] = useState(pips_compra ?? 0.03);
  const [pipsVenta, setPipsVenta] = useState(pips_venta ?? -0.01);
  const [overlay, setOverlay] = useState(null);
  const [overlayMsg, setOverlayMsg] = useState(null);

  const handleDismiss = useCallback(() => {
    setOverlay(null);
    setOverlayMsg(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOverlay("loading");
    setOverlayMsg(null);
    const token = document.querySelector('meta[name="csrf-token"]').content;

    try {
      const res = await fetch("/admin/tipo-cambio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
          Accept: "application/json",
        },
        body: JSON.stringify({
          pips_compra: pipsCompra,
          pips_venta: pipsVenta,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOverlayMsg("Tipo de cambio actualizado.");
        setOverlay("success");
      } else {
        setOverlayMsg(data?.message || "Error al actualizar el tipo de cambio.");
        setOverlay("error");
      }
    } catch (err) {
      console.error(err);
      setOverlayMsg("Error de conexión. Intente nuevamente.");
      setOverlay("error");
    }
  };

  return (
    <div className="w-full flex flex-col items-center">

      <AdminOverlay
        state={overlay}
        message={overlayMsg}
        autoDismiss={3000}
        onDismiss={handleDismiss}
      />

      <h2 className="text-3xl font-semibold mb-6 text-gray-700">
        Actualizar Tipo de Cambio
      </h2>
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

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4"
      >

        <p className="text-sm text-gray-500 -mb-2">
          Ajustes automáticos (próxima actualización del bot)
        </p>

        <label className="flex flex-col">
          <span className="font-semibold mb-1">
            Pips Compra:
            <span className="ml-2 text-xs font-normal text-gray-400">
              se suma al tipo de cambio de compra
            </span>
          </span>
          <input
            type="number"
            step="0.01"
            value={pipsCompra}
            onChange={(e) => setPipsCompra(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold mb-1">
            Pips Venta:
            <span className="ml-2 text-xs font-normal text-gray-400">
              se suma al tipo de cambio de venta (puede ser negativo)
            </span>
          </span>
          <input
            type="number"
            step="0.01"
            value={pipsVenta}
            onChange={(e) => setPipsVenta(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </label>

        <button
          type="submit"
          disabled={overlay === "loading"}
          className="bg-blue-500 text-white rounded p-2 mt-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
