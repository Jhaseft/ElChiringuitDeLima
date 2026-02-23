import { useEffect, useState } from "react";
import axios from "axios";
import DetailModalUser from "./DetailModalUsers";
import DetailModalAccount from "./DetailModalAccount";
import { Eye, Wallet, Search } from "lucide-react";
import AdminOverlay from "../AdminOverlay";

const kycBadge = {
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function AdminUserMediaTable() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  //users
  const [detailOpenUser, setDetailOpenUser] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  //Accounts
  const [detailOpenAccounts, setDetailOpenAccounts] = useState(false);
  const [detailAccount, setDetailAccount] = useState(null);
    // "loading" | "success" | "error" | null
  const [overlay, setOverlay] = useState(null);

  const fetchList = async (page = 1, perPage = meta.per_page, q = search) => {
    try {
      setLoading(true);
      const { data } = await axios.get("/admin/users", {
        params: { page, perPage, search: q },
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
      alert("Error al cargar la tabla.");
    } finally {
      setLoading(false);
    }
  };

  const openDetailuser = async (id) => {
    try {
      setOverlay("loading");
      const { data } = await axios.get(`/admin/users/${id}/detail/info`);
      setDetailUser(data);
      setOverlay(null);
      setDetailOpenUser(true); 
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar el detalle.");
    } finally {
      setProcessing(false);
    }
  };

  const openDetailaccount = async (id) => {
    try {
      setOverlay("loading");
      const { data } = await axios.get(`/admin/users/${id}/detail/accounts`);
      setDetailAccount(data);
      setOverlay(null);
      setDetailOpenAccounts(true);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar el detalle.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchList(1);
  }, []);

   const busy = overlay === "loading";

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchList(1);
  };

  return (
    <div className="relative">

   
      <AdminOverlay
              state={overlay}
              onDismiss={() => {
                if (overlay === "success") fetchList(meta.current_page);
                setOverlay(null);
              }}
            />

     
      <form onSubmit={onSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 sm:flex-none">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, email o documento…"
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
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">CI/DNI</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Teléfono</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">KYC</th>
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
                    {r.first_name} {r.last_name}
                    <div className="sm:hidden text-xs text-gray-400 mt-0.5">{r.email}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{r.email}</td>
                  <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{r.document_number}</td>
                  <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{r.phone || "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${kycBadge[r.kyc_status] || "bg-gray-100 text-gray-600"}`}>
                      {r.kyc_status}
                    </span>
                  </td> 
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailuser(r.id)}
                        title="Ver detalle"
                        disabled={busy}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openDetailaccount(r.id)}
                        title="Ver cuenta"
                        disabled={busy}
                        className="p-1.5 rounded-lg bg-amber-400 text-white hover:bg-amber-500 transition disabled:opacity-50"
                      >
                        <Wallet size={15} />
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
            onClick={() => fetchList(meta.current_page - 1)}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            ← Anterior
          </button>
          <button
            disabled={meta.current_page >= meta.last_page || busy}
            onClick={() => fetchList(meta.current_page + 1)}
            className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {detailOpenUser && detailUser && (
        <DetailModalUser detail={detailUser} onClose={() => setDetailOpenUser(false)} />
      )}

      {detailOpenAccounts && detailAccount && (
        <DetailModalAccount detail={detailAccount} onClose={() => setDetailOpenAccounts(false)} />
      )}

    </div>
  );
}
