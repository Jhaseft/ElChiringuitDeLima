// ModalOperacion.jsx
import { useState, useEffect } from "react";
import { X, Trash2, Plus } from "lucide-react";
import ModalCuentaBancaria from "./ModalCuentaBancaria";
import ModalCuentaDestino from "./ModalCuentaDestino";
import ModalTransferencia from "./ModalTransferencia";
import CuentaSelect from "./CuentaSelect";

export default function ModalOperacion({ isOpen, onClose, user, monto, conversion, tasa, tipoCambio, bancos }) {
  const [juramento, setJuramento] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openCuentaOrigen, setOpenCuentaOrigen] = useState(false);
  const [openCuentaDestino, setOpenCuentaDestino] = useState(false);
  const [openTransferencia, setOpenTransferencia] = useState(false);

  const [cuentaOrigen, setCuentaOrigen] = useState(null);
  const [cuentaDestino, setCuentaDestino] = useState(null);

  const [cuentasUsuario, setCuentasUsuario] = useState([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    setLoadingCuentas(true);
    fetch(`/operacion/listar-cuentas/${user.id}`)
      .then(res => res.json())
      .then(data => setCuentasUsuario(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingCuentas(false));
  }, [user?.id]);

  if (!isOpen) return null;

  const cuentasOrigen = cuentasUsuario.filter(c => c.account_type === "origin");
  const cuentasDestino = cuentasUsuario.filter(c => c.account_type === "destination");

  const eliminarCuenta = (cuenta) => {
    if (!cuenta) return;
    if (!confirm(`¿Seguro que quieres eliminar la cuenta ${cuenta.account_number}?`)) return;

    setLoading(true);
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch(`/operacion/eliminar-cuenta/${cuenta.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': token,
      },
    })
      .then(res => res.json())
      .then(() => {
        setCuentasUsuario(prev => prev.filter(c => c.id !== cuenta.id));
        if (cuenta.account_type === 'origin') setCuentaOrigen(null);
        if (cuenta.account_type === 'destination') setCuentaDestino(null);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSiguiente = () => {
    if (loading) return;
    if (!(juramento && terminos && cuentaOrigen && cuentaDestino)) return;

    if (user.kyc_status === "pending" || user.kyc_status === "rejected") {
      alert("Debes completar tu KYC antes de continuar con la operación.");
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/face?next=${next}`;
      return;
    }

    setOpenTransferencia(true);
  };

  return (
    <>
      {/* Fondo del modal con z-index alto */}
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-2">
        {/* Card del modal */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto mt-11">
          {/* Botón cerrar */}
          <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition" onClick={onClose}>
            <X size={22} />
          </button>

          <h2 className="text-lg md:text-xl font-bold mb-6 text-center text-gray-800">Registro de Operación</h2>

          {/* Monto y Conversión */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex-1 min-w-[140px] border rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Monto</p>
              <p className="text-gray-800">{monto}</p>
            </div>
            <div className="flex-1 min-w-[140px] border rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Conversión</p>
              <p className="text-gray-800">{conversion}</p>
            </div>
          </div>

          <div className="mb-4">
            <input type="text" readOnly value="Persona Natural" className="w-full border rounded-lg px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-700" />
          </div>

          <div className="mb-4 text-sm border p-3 rounded-lg bg-gray-50">
            <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>CI:</strong> {user.document_number || "N/A"}</p>
            <p className="mt-2 text-xs text-gray-600">KYC: <span className={user.kyc_status === 'active' ? 'text-green-600' : 'text-orange-600'}>{user.kyc_status}</span></p>
          </div>

          {/* Cuenta Origen */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Numero de Cuenta Origen</p>
            {loadingCuentas ? (
              <p className="text-gray-500 text-sm">Cargando cuentas...</p>
            ) : (
              <div className="flex  gap-2 items-center">
                <CuentaSelect
                  options={cuentasOrigen}
                  value={cuentaOrigen}
                  onChange={setCuentaOrigen}
                  placeholder="Selecciona o Agregue una cuenta"
                  disabled={loading}
                />
                <button onClick={() => setOpenCuentaOrigen(true)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center" title="Agregar cuenta">
                  <Plus size={18} />
                </button>
                <button onClick={() => eliminarCuenta(cuentaOrigen)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center" title="Eliminar cuenta seleccionada" disabled={!cuentaOrigen || loading}>
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Cuenta Destino */}
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Numero de Cuenta Destino</p>
            {loadingCuentas ? (
              <p className="text-gray-500 text-sm">Cargando cuentas...</p>
            ) : (
              <div className="flex  gap-2 items-center">
                <CuentaSelect
                  options={cuentasDestino}
                  value={cuentaDestino}
                  onChange={setCuentaDestino}
                  placeholder="Selecciona o Agregue una cuenta"
                  disabled={loading}
                />
                <button onClick={() => setOpenCuentaDestino(true)} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center" title="Agregar cuenta">
                  <Plus size={18} />
                </button>
                <button onClick={() => eliminarCuenta(cuentaDestino)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center" title="Eliminar cuenta seleccionada" disabled={!cuentaDestino || loading}>
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Políticas */}
          <div className="mb-4 text-xs text-gray-600 flex flex-col gap-2">
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={juramento} onChange={() => setJuramento(!juramento)} />
              <span>Declaro bajo juramento que la información registrada es veraz y exacta.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={terminos} onChange={() => setTerminos(!terminos)} />
              <span>Acepto los <span className="text-blue-600 underline cursor-pointer">Términos y condiciones y la Política de privacidad</span></span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex flex-col md:flex-row md:justify-end gap-2">
            <button onClick={onClose} className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition w-full md:w-auto">Cancelar</button>
            <button
              onClick={handleSiguiente}
              className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition w-full md:w-auto ${!(juramento && terminos && cuentaOrigen && cuentaDestino) ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!(juramento && terminos && cuentaOrigen && cuentaDestino || loading)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Spinner de carga */}
      {loading && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}

      {/* Modales hijos */}
      <ModalCuentaBancaria isOpen={openCuentaOrigen} bancos={bancos} onClose={() => setOpenCuentaOrigen(false)} user={user} nationality={user.nationality} accountType="origin" onCuentaGuardada={(data) => {
        const bancoSeleccionado = bancos.find(b => b.id === data.bank_id);
        const cuentaConBanco = {
          ...data,
          bank_name: bancoSeleccionado?.name || "",
          bank_logo: bancoSeleccionado?.logo_url || "",
          owner_full_name: data.owner_full_name || null,
          owner_document: data.owner_document || null,
          owner_phone: data.owner_phone || null,
        };
        setCuentasUsuario(prev => [...prev, cuentaConBanco]);
        setCuentaOrigen(cuentaConBanco);
        setOpenCuentaOrigen(false);
      }} />

      <ModalCuentaDestino isOpen={openCuentaDestino} bancos={bancos} onClose={() => setOpenCuentaDestino(false)} user={user} nationality={user.nationality} accountType="destination" onCuentaGuardada={(data) => {
        const bancoSeleccionado = bancos.find(b => b.id === data.bank_id);
        const cuentaConBanco = {
          ...data,
          bank_name: bancoSeleccionado?.name || "",
          bank_logo: bancoSeleccionado?.logo_url || "",
          owner_full_name: data.owner_full_name || null,
          owner_document: data.owner_document || null,
          owner_phone: data.owner_phone || null,
        };
        setCuentasUsuario(prev => [...prev, cuentaConBanco]);
        setCuentaDestino(cuentaConBanco);
        setOpenCuentaDestino(false);
      }} />

      <ModalTransferencia isOpen={openTransferencia} onClose={() => setOpenTransferencia(false)} user={user} tasa={tasa} monto={monto} conversion={conversion} tipoCambio={tipoCambio} cuentaOrigen={cuentaOrigen} cuentaDestino={cuentaDestino} />
    </>
  );
}
