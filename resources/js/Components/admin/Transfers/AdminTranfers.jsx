import { useEffect, useState } from "react";
import axios from "axios";
import TransferModal from "./TransferModal";
import { Search, Eye, Trash2 } from "lucide-react";

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminTransfersTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchList = async (page = 1, perPage = meta.per_page, q = search) => {
    try {
      setLoading(true);
      const { data } = await axios.get("/admin/transfers", {
        params: { page, perPage, search: q },
        withCredentials: true,
      });
      setRows(data.data || []);
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch (e) {
      console.error(e);
      alert("Error al cargar la tabla de transferencias.");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id) => {
    try {
      setProcessing(true);
      const { data } = await axios.get(`/admin/transfers/${id}`, { withCredentials: true });
      setDetail(data);
      setDetailOpen(true);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar el detalle de la transferencia.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta transferencia?")) return;
    try {
      await axios.delete(`/admin/transfers/${id}`, { withCredentials: true });
      fetchList(meta.current_page, meta.per_page, search);
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar la transferencia.");
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchList(1);
  };

  useEffect(() => {
    fetchList(1);
  }, []);

  return (
    <div className="relative">

  
      {processing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">Procesando…</p>
          </div>
        </div>
      )}

  
      <form onSubmit={onSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 sm:flex-none">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Usuario, cuenta o estado…"
            className="border rounded-xl pl-9 pr-3 py-2 w-full sm:w-72 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition whitespace-nowrap"
        >
          Buscar
        </button>
      </form>

  
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full text-sm divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Cuenta Origen</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Cuenta Destino</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">Cargando…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">Sin resultados</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {r.user.first_name} {r.user.last_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                    <span className="font-medium">{r.origin_account?.bank?.name || "—"}</span>
                    <span className="text-gray-400"> · {r.origin_account?.account_number || "N/A"}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">
                    <span className="font-medium">{r.destination_account?.bank?.name || "—"}</span>
                    <span className="text-gray-400"> · {r.destination_account?.account_number || "N/A"}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{r.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge[r.status] || "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetail(r.id)}
                        title="Ver detalle"
                        disabled={processing}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        title="Eliminar"
                        disabled={processing}
                        className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
        <p className="text-xs text-gray-500">
          Página {meta.current_page} de {meta.last_page} — {meta.total} registros
        </p>
        <div className="flex gap-2">
          <button
            disabled={meta.current_page <= 1 || processing}
            onClick={() => fetchList(meta.current_page - 1)}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Anterior
          </button>
          <button
            disabled={meta.current_page >= meta.last_page || processing}
            onClick={() => fetchList(meta.current_page + 1)}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {detailOpen && detail && (
        <TransferModal
          selected={detail}
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
          onUpdated={() => fetchList(meta.current_page)}
        />
      )}
    </div>
  );
}
