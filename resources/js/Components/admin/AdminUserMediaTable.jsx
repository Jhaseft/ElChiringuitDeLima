// resources/js/Components/admin/AdminUserMediaTable.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUserMediaTable() {
  //hook para guardaer los datos de la tabla
  const [rows, setRows] = useState([]);
  //hook para guardar los metadatos de la tabla
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  //hook para manejar el estado de carga de la tabla
  const [loading, setLoading] = useState(false);
  //hook para manejar el estado de busqueda
  const [search, setSearch] = useState("");
//hook para manejar el estado del modal de detalle si es open o cerrado
  const [detailOpen, setDetailOpen] = useState(false);
  //hook para guardar los datos del detalle del usuario seleccionado para el modal y asi tener mas velocidad
  const [detail, setDetail] = useState(null);
  //hook para manejar el estado de procesamiento global (detalle)
  const [processing, setProcessing] = useState(false); // Loader global (detalle)

//espera una promesa para obtener los datos de la tabla hasta que no se resuelva esta en estado de carga pero la pagina no se congela
//por eso usamos una funcion asyncrona
  const fetchList = async (page = 1, perPage = meta.per_page, q = search) => {
    try {
      setLoading(true);
      //con await esperamsoos la respuesta de la peticion get
      const { data } = await axios.get("/admin/users", {
        //definimos los parametros de la peticion para mejorar la paginacion y busqueda
        params: { page, perPage, search: q },
      });
      //seteamos los datos de la tabla y los metadatos con los de la base de datos
      setRows(data.data || []);
      //le pasamos los metadatos que necesitamos para la paginacion
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
//funcion para abrir el modal de detalle y cargar los datos del usuario seleccionado igual asincrono
  const openDetail = async (id) => {
    try {
      //procesa la peticion
      setProcessing(true);
      //espera la respuesta de la peticion get para obtener los datos del usuario seleccionado
      const { data } = await axios.get(`/admin/users/${id}/detail`);
      //setea los datos del detalle y abre el modal con los datos del usuario seleccionado
      setDetail(data);
      //luego abre el modal
      setDetailOpen(true);
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

//funcion para manejar la busqueda de usuarios
  const onSearch = async (e) => {
    //evita que se recargue la pagina
    e.preventDefault();
    //llama a la funcion fetchList para obtener los datos de la tabla con la busqueda
    await fetchList(1);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow p-4 sm:p-6">
      {/* Overlay Loader global */}
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
            placeholder="Buscar por nombre, email o documento"
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
              <th className="py-2 px-3 text-left">Usuario</th>
              <th className="py-2 px-3 text-left">Email</th>
              <th className="py-2 px-3 text-left">CI/DNI</th>
              <th className="py-2 px-3 text-left">Teléfono</th>
              <th className="py-2 px-3 text-left">KYC Status</th>
              <th className="py-2 px-3 text-left">Acciones</th>
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
                  <td className="py-2 px-3">{r.first_name} {r.last_name}</td>
                  <td className="py-2 px-3">{r.email}</td>
                  <td className="py-2 px-3">{r.document_number}</td>
                  <td className="py-2 px-3">{r.phone || '—'}</td>
                  <td className="py-2 px-3">{r.kyc_status}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openDetail(r.id)}
                        className="px-3 py-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                        disabled={processing}
                      >
                        Ver detalle
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

      {detailOpen && detail && <DetailModal detail={detail} onClose={() => setDetailOpen(false)} />}
    </div>
  );
}

function DetailModal({ detail, onClose }) {
  const { media, accounts } = detail;
  const excludedKeys = ["id", "created_at", "updated_at", "password", "remember_token", "media", "accounts"];
  const userFields = Object.keys(detail).filter(
    (key) => !excludedKeys.includes(key) && !(typeof detail[key] === "object")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh] relative">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Detalle del Usuario</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {userFields.map((key) => (
                  <th key={key} className="py-2 px-3 text-left capitalize">{key.replace(/_/g, " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                {userFields.map((key) => (
                  <td key={key} className="py-2 px-3">{detail[key] || '—'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Medios */}
        <div className="mt-6">
          <div className="font-medium mb-2">Medios</div>
          {media?.length ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {media.map((m) => (
                <div key={m.id} className="space-y-1">
                  <div><span className="font-medium">Posición:</span> {m.position === 1 ? 'Frontal' : m.position === 2 ? 'Trasera' : 'Video'}</div>
                  <div><span className="font-medium">Tipo:</span> {m.media_type}</div>
                  {m.media_type === 'image' ? (
                    <img src={m.url} alt="" className="w-50 max-h-40 object-contain rounded-xl border" />
                  ) : (
                    <video src={m.url} controls className="w-50 max-h-40 rounded-xl border" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Sin medios registrados.</div>
          )}
        </div>

        {/* Cuentas del usuario */}
        <div className="mt-6">
          <div className="font-medium mb-2">Cuentas del usuario</div>
          {accounts?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left">Banco</th>
                    <th className="py-2 px-3 text-left">N° Cuenta</th>
                    <th className="py-2 px-3 text-left">Tipo</th>
                    <th className="py-2 px-3 text-left">Titular</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2 px-3">{a.bank?.name || '—'}</td>
                      <td className="py-2 px-3">{a.account_number}</td>
                      <td className="py-2 px-3">{a.account_type}</td>
                      <td className="py-2 px-3">{a.owner ? `(Nombre:${a.owner.full_name}) (CI: ${a.owner.document_number}) (phone: ${a.owner.phone})` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Sin cuentas registradas.</div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border hover:bg-gray-100 transition">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
