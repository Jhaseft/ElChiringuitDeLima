import { useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import TransferModal from "./TransferModal";
import UserModal from "./UserModal";
import AdminOverlay from "../AdminOverlay";
import { Search, Trash2, UserRoundCog, BanknoteArrowUp, Receipt, ShieldCheck } from "lucide-react";

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabel = {
  pending: "Pendiente",
  completed: "Completado",
  rejected: "Rechazado",
};

export default function AdminTransfersTable({ transfers, filters = {} }) {
  const rows = transfers?.data || [];
  const meta = {
    current_page: transfers?.current_page ?? 1,
    last_page: transfers?.last_page ?? 1,
    per_page: transfers?.per_page ?? 10,
    total: transfers?.total ?? 0,
  };

  const [search, setSearch] = useState(filters.search || "");
  const [loading, setLoading] = useState(false);
  const [detailOpenUser, setDetailOpenUser] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [detailOpenTransfer, setDetailOpenTransfer] = useState(false);
  const [detailTransfer, setDetailTranfer] = useState(null);
  const [overlay, setOverlay] = useState(null);
 
  const navigate = (params) => {
    router.get("/admin/dashboard/efectivo", params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onStart: () => setLoading(true),
      onFinish: () => setLoading(false),
    });
  };

  const onSearch = (e) => {
    e.preventDefault();
    navigate({ page: 1, perPage: meta.per_page, search });
  };

  const openDetailUser = async (id) => {
    try {
      setOverlay("loading");
      const { data } = await axios.get(`/admin/transfers/user/${id}`, { withCredentials: true });
      setDetailUser(data);
      setOverlay(null);
      setDetailOpenUser(true);
    } catch (e) {
      console.error(e);
      setOverlay("error");
    }
  };

  const openDetailTransfer = async (id) => {
    try {
      setOverlay("loading");
      const { data } = await axios.get(`/admin/transfers/detail/${id}`, { withCredentials: true });
      setDetailTranfer(data);
      setOverlay(null);
      setDetailOpenTransfer(true);
    } catch (e) {
      console.error(e);
      setOverlay("error");
    }
  };

 

  const busy = overlay === "loading" || loading;

  return (
    <div>

      <AdminOverlay
        state={overlay}
        onDismiss={() => {
          if (overlay === "success") router.reload({ preserveScroll: true });
          setOverlay(null);
        }}
      />

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
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
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
                    {r.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {r.user?.first_name} {r.user?.last_name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{r.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[r.status] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[r.status] || r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailUser(r.id)}
                        title="Ver informacion del  usuario"
                        disabled={busy}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <UserRoundCog size={20} />
                      </button>

                      <button
                        onClick={() => openDetailTransfer(r.id)}
                        title="Ver detalle de la transferencia"
                        disabled={busy}
                        className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                      >
                        <BanknoteArrowUp size={20} />
                      </button>

                      <button
                        onClick={() => window.open(`${r.client_receipt}`, "_blank")}
                        title="Ver comprobante del cliente"
                        disabled={busy || !r.client_receipt}
                        className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Receipt size={20} />
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
            disabled={meta.current_page <= 1 || busy}
            onClick={() => navigate({ page: meta.current_page - 1, perPage: meta.per_page, search })}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Anterior
          </button>
          <button
            disabled={meta.current_page >= meta.last_page || busy}
            onClick={() => navigate({ page: meta.current_page + 1, perPage: meta.per_page, search })}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {detailOpenUser && detailUser && (
        <UserModal
          selected={detailUser}
          isOpen={detailOpenUser}
          onClose={() => setDetailOpenUser(false)}
        />
      )}

      {detailOpenTransfer && detailTransfer && (
        <TransferModal
          selected={detailTransfer}
          isOpen={detailOpenTransfer}
          onClose={() => setDetailOpenTransfer(false)}
          onUpdated={() => router.reload({ preserveScroll: true })}
        />
      )}
    </div>
  );
}
