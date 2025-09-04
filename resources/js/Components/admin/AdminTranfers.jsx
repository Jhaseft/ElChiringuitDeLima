// resources/js/Components/admin/AdminTransfersTable.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import TransferModal from "./TransferModal";

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

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchList(1);
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

  useEffect(() => {
    fetchList(1);
  }, []);

  return (
    <div className="relative bg-white rounded-2xl shadow p-4 sm:p-6">
      {processing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
            <div className="text-white font-medium">Procesando… Esto puede tardar unos segundos</div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <form onSubmit={onSearch} className="flex gap-2 flex-wrap">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario, cuenta o estado"
            className="border rounded-xl px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            Buscar
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 text-left text-black">Usuario</th>
              <th className="py-2 px-3 text-left text-black">Cuenta Origen</th>
              <th className="py-2 px-3 text-left text-black">Cuenta Destino</th>
              <th className="py-2 px-3 text-left text-black">Monto</th>
              <th className="py-2 px-3 text-left text-black">Estado</th>
              <th className="py-2 px-3 text-left text-black">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="py-6 text-center">Cargando…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center">Sin resultados</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-black">{r.user.first_name} {r.user.last_name}</td>
                  <td className="py-2 px-3 text-black">{r.origin_account?.bank?.name || '—'} - {r.origin_account?.account_number || 'N/A'}</td>
                  <td className="py-2 px-3 text-black">{r.destination_account?.bank?.name || '—'} - {r.destination_account?.account_number || 'N/A'}</td>
                  <td className="py-2 px-3 text-black">{r.amount}</td>
                  <td className="py-2 px-3 capitalize text-black">{r.status}</td>
                  <td className="py-2 px-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => openDetail(r.id)}
                      className="px-3 py-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                      disabled={processing}
                    >
                      Ver detalle
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                      disabled={processing}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
        <div className="text-sm text-gray-600">
          Página {meta.current_page} de {meta.last_page} — {meta.total} registros
        </div>
        <div className="flex gap-2">
          <button
            disabled={meta.current_page <= 1 || processing}
            onClick={() => fetchList(meta.current_page - 1)}
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={meta.current_page >= meta.last_page || processing}
            onClick={() => fetchList(meta.current_page + 1)}
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {detailOpen && detail && <TransferModal selected={detail} isOpen={detailOpen} onClose={() => setDetailOpen(false)} onUpdated={() => fetchList(meta.current_page)} />}
    </div>
  );
}
