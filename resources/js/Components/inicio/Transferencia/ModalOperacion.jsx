// ModalOperacion.jsx
import { useState, useEffect } from "react";
import {
  X, Trash2, Plus, Banknote, QrCode, MapPin, ExternalLink, Upload, RefreshCw,
} from "lucide-react";
import { apiPost, apiDelete, getApiErrorMessage } from "@/utils/http";
import ModalCuentaBancaria from "./ModalCuentaBancaria";
import ModalCuentaDestino from "./ModalCuentaDestino";
import ModalTransferencia from "./ModalTransferencia";
import CuentaSelect from "../shared/CuentaSelect";

const OFICINAS = [
  {
    nombre: "Oficina Cochabamba",
    direccion: "Av. Villazón, calle Los Paraisos – frente a UDABOL",
    horario: "Lun–Vie 9:00–18:00 | Sáb 9:00–13:00",
    linkMapa: "https://maps.app.goo.gl/EnjPUumyYn7hSRxH7",
  },
];

export default function ModalOperacion({
  isOpen,
  onClose,
  user,
  monto,
  conversion,
  tasa,
  modo,              // "BOBtoPEN" | "PENtoBOB"
  modoDescripcion,
  bancos,
  metodosPago,
}) {
  // ── flags de qué lado es banco ──────────────────────────────
  const isOriginBank      = modo === "PENtoBOB"; // cliente paga por banco PE
  const isDestinationBank = modo === "BOBtoPEN"; // cliente recibe en banco PE

  const [juramento, setJuramento] = useState(false);
  const [terminos, setTerminos]   = useState(false);
  const [loading, setLoading]     = useState(false);

  const [openCuentaOrigen, setOpenCuentaOrigen]     = useState(false);
  const [openCuentaDestino, setOpenCuentaDestino]   = useState(false);
  const [openTransferencia, setOpenTransferencia]   = useState(false);

  const [cuentaOrigen, setCuentaOrigen]             = useState(null);
  const [cuentaDestino, setCuentaDestino]           = useState(null);

  const [cuentasUsuario, setCuentasUsuario]         = useState([]);
  const [loadingCuentas, setLoadingCuentas]         = useState(false);
  const [eliminandoCuenta, setEliminandoCuenta]     = useState(false);

  // ── método no bancario seleccionado en el lado boliviano ───
  const [nonBankMethod, setNonBankMethod]           = useState(null); // 'cash' | 'qr'

  // ── QR del usuario (solo PENtoBOB + qr) ────────────────────
  const [qrUserAccount, setQrUserAccount]           = useState(null);
  const [loadingQrUser, setLoadingQrUser]           = useState(false);
  const [imagenQR, setImagenQR]                     = useState(null);
  const [subiendoQR, setSubiendoQR]                 = useState(false);
  const [errorQR, setErrorQR]                       = useState("");
  const [mostrarCambiarQR, setMostrarCambiarQR]     = useState(false);

  const updateCache = (userId, cuentas) => {
    localStorage.setItem(`cuentas_${userId}`, JSON.stringify(cuentas));
  };

  // ── reset al abrir / cambiar modo ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setNonBankMethod(null);
    setCuentaOrigen(null);
    setCuentaDestino(null);
    setQrUserAccount(null);
    setImagenQR(null);
    setMostrarCambiarQR(false);
    setErrorQR("");
  }, [modo, isOpen]);

  // ── cargar cuentas bancarias del usuario ───────────────────
  useEffect(() => {
    if (!user?.id || !isOpen) return;
    setLoadingCuentas(true);
    fetch(`/operacion/listar-cuentas/${user.id}/bank`)
      .then((res) => res.json())
      .then((data) => setCuentasUsuario(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingCuentas(false));
  }, [user?.id, isOpen]);

  // ── cargar QR del usuario (solo PENtoBOB + qr) ─────────────
  useEffect(() => {
    if (!isOpen || !user?.id) return;
    if (modo !== "PENtoBOB" || nonBankMethod !== "qr") return;
    setLoadingQrUser(true);
    fetch(`/operacion/listar-cuentas/${user.id}/qr`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((c) => c.qr_country === "BO");
        setQrUserAccount(found ?? null);
      })
      .catch(() => setQrUserAccount(null))
      .finally(() => setLoadingQrUser(false));
  }, [isOpen, user?.id, modo, nonBankMethod]);

  if (!isOpen) return null;



  // ── filtros de cuentas bancarias (idéntico al filtro previo) ─
  const cuentasOrigen = cuentasUsuario.filter((c) => {
    const banco = bancos.find((b) => b.id === c.bank_id);
    if (!banco) return false;
    if (modo === "PENtoBOB") return c.account_type === "origin" && banco.country === "peru";
    if (modo === "BOBtoPEN") return c.account_type === "origin" && banco.country === "bolivia";
    return false;
  });

  const cuentasDestino = cuentasUsuario.filter((c) => {
    const banco = bancos.find((b) => b.id === c.bank_id);
    if (!banco) return false;
    if (modo === "PENtoBOB") return c.account_type === "destination" && banco.country === "bolivia";
    if (modo === "BOBtoPEN") return c.account_type === "destination" && banco.country === "peru";
    return false;
  });


  // ── eliminar cuenta bancaria ───────────────────────────────
  const handleEliminarCuenta = async (cuenta, tipo) => {
    if (!cuenta?.id || eliminandoCuenta) return;
    if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return;
    setEliminandoCuenta(true);
    try {
      await apiDelete(`/eliminar/${cuenta.id}`);
      const nuevas = cuentasUsuario.filter((c) => c.id !== cuenta.id);
      setCuentasUsuario(nuevas);
      updateCache(user.id, nuevas);
      if (tipo === "origen") setCuentaOrigen(null);
      if (tipo === "destino") setCuentaDestino(null);
    } catch (err) {
      alert(getApiErrorMessage(err, "No se pudo eliminar la cuenta"));
    } finally {
      setEliminandoCuenta(false);
    }
  };

  // ── guardar QR del usuario ─────────────────────────────────
  const handleGuardarQR = async () => {
    if (!imagenQR) {
      setErrorQR("Selecciona una imagen.");
      return;
    }
    setSubiendoQR(true);
    setErrorQR("");
    try {
      const fd = new FormData();
      fd.append("user_id", user.id);
      fd.append("method_type", "qr");
      fd.append("qr_country", "BO");
      fd.append("qr_image", imagenQR);
      const { data: cuenta } = await apiPost("/operacion/guardar-cuenta", fd);
      setQrUserAccount({
        id: cuenta.id,
        qr_value: cuenta.qr_value,
        qr_country: cuenta.qr_country,
      });
      setMostrarCambiarQR(false);
      setImagenQR(null);
    } catch (err) {
      setErrorQR(getApiErrorMessage(err, "Error al guardar el QR."));
    } finally {
      setSubiendoQR(false);
    }
  };

  // ── QR de la empresa en Bolivia (solo BOBtoPEN + qr) ───────
  const empresaQRBolivia = metodosPago.find(
    (m) => m.currency_pair === "BOBtoPEN" && m.type === "qr"
  );

  // ── validación para habilitar Siguiente ────────────────────
  const sideBancoOk = isOriginBank ? !!cuentaOrigen : !!cuentaDestino;
  const sideNoBancoOk =
    nonBankMethod === "cash" ||
    (nonBankMethod === "qr" && modo === "PENtoBOB" && qrUserAccount && !mostrarCambiarQR) ||
    (nonBankMethod === "qr" && modo === "BOBtoPEN" && !!empresaQRBolivia && !!cuentaOrigen);

  const puedeSeguir = juramento && terminos && sideBancoOk && sideNoBancoOk;

  const handleSiguiente = () => {
    if (loading || !puedeSeguir) return;
    setOpenTransferencia(true);
  };

  const monedaOrigen = modo === "PENtoBOB" ? "PEN" : "BOB";
  const monedaDestino = modo === "PENtoBOB" ? "BOB" : "PEN";


  // ═══════════════════════════════════════════════════════════
  // Subcomponentes inline
  // ═══════════════════════════════════════════════════════════

  const SeccionBanco = ({ label, value, setValue, options, openModal, addBtnColor, tipo }) => (

  

    <div className="mb-4">
      <p className="text-sm font-semibold mb-2">{label}</p>
      {loadingCuentas ? (
        <p className="text-gray-500 text-sm animate-pulse">Cargando cuentas...</p>
      ) : (
        <div className="flex gap-2 items-center">
          <CuentaSelect
            options={options}
            value={value}
            onChange={setValue}
            placeholder="Selecciona o agrega una cuenta"
            disabled={loading}
          />
          <button
            onClick={openModal}
            className={`${addBtnColor} text-white p-2 rounded-lg transition`}
            title="Agregar cuenta"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => handleEliminarCuenta(value, tipo)}
            disabled={!value || eliminandoCuenta}
            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Eliminar cuenta"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );

  const SeccionNoBanco = ({ label }) => (
    <div className="mb-4">
      <p className="text-sm font-semibold mb-2">{label}</p>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setNonBankMethod("cash")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-semibold transition ${
            nonBankMethod === "cash"
              ? "bg-yellow-400 text-gray-900 border-yellow-400"
              : "bg-white text-gray-700 border-gray-300 hover:border-yellow-400"
          }`}
        >
          <Banknote size={16} /> Efectivo
        </button>
        <button
          type="button"
          onClick={() => setNonBankMethod("qr")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-semibold transition ${
            nonBankMethod === "qr"
              ? "bg-yellow-400 text-gray-900 border-yellow-400"
              : "bg-white text-gray-700 border-gray-300 hover:border-yellow-400"
          }`}
        >
          <QrCode size={16} /> QR
        </button>
      </div>

      {nonBankMethod === "cash" && (
        <div className="border rounded-lg bg-gray-50 p-3 text-sm flex flex-col gap-2">
          {OFICINAS.map((of, i) => (
            <div key={i}>
              <p className="font-semibold flex items-center gap-1 text-gray-800">
                <MapPin size={14} /> {of.nombre}
              </p>
              <p className="text-gray-600 text-xs">{of.direccion}</p>
              <p className="text-gray-500 text-xs">{of.horario}</p>
              <a
                href={of.linkMapa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"
              >
                <ExternalLink size={12} /> Ver en Google Maps
              </a>
            </div>
          ))}
        </div>
      )}

      {nonBankMethod === "qr" && modo === "PENtoBOB" && (
        <div className="border rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-2">
            Tu QR para recibir en Bolivia (Bolivianos)
          </p>
          {loadingQrUser ? (
            <p className="text-xs text-gray-400 animate-pulse">Verificando tu QR...</p>
          ) : qrUserAccount && !mostrarCambiarQR ? (
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-2 rounded-xl border">
                <img
                  src={qrUserAccount.qr_value}
                  alt="Tu QR"
                  className="w-32 h-32 object-contain"
                />
              </div>
              <p className="text-xs text-green-600 font-semibold">QR guardado</p>
              <button
                onClick={() => {
                  setMostrarCambiarQR(true);
                  setImagenQR(null);
                  setErrorQR("");
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <RefreshCw size={12} /> Cambiar QR
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500">
                {mostrarCambiarQR
                  ? "Sube la nueva imagen de tu QR."
                  : "Sube la imagen de tu QR para continuar."}
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => setImagenQR(e.target.files[0])}
                className="w-full text-sm"
              />
              {imagenQR && <p className="text-xs text-gray-500">Archivo: {imagenQR.name}</p>}
              {errorQR && <p className="text-xs text-red-600">{errorQR}</p>}
              <div className="flex items-center gap-2">
                {mostrarCambiarQR && (
                  <button
                    onClick={() => setMostrarCambiarQR(false)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={handleGuardarQR}
                  disabled={subiendoQR || !imagenQR}
                  className="flex items-center gap-1 bg-blue-600 text-white py-1.5 px-3 rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Upload size={12} />
                  {subiendoQR ? "Subiendo..." : "Guardar QR"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {nonBankMethod === "qr" && modo === "BOBtoPEN" && (
        <div className="border rounded-lg bg-gray-50 p-3 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">Pagarás escaneando nuestro QR de Bolivia</p>
          {empresaQRBolivia ? (
            <div className="bg-white p-2 rounded-xl border">
              <img
                src={empresaQRBolivia.image}
                alt={empresaQRBolivia.title}
                className="w-36 h-36 object-contain"
              />
            </div>
          ) : (
            <p className="text-xs text-red-600">No hay QR de empresa configurado.</p>
          )}
          <p className="text-xs text-gray-500 text-center">
            Confirmas el pago y subes el comprobante en el siguiente paso.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-2">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto mt-11">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
            onClick={onClose}
          >
            <X size={22} />
          </button>

          <h2 className="text-lg md:text-xl font-bold mb-6 text-center text-gray-800">
            Registro de Operación
          </h2>

          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex-1 min-w-[140px] border rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Monto</p>
              <p className="text-gray-800">{monto} {monedaOrigen}</p>
            </div>
            <div className="flex-1 min-w-[140px] border rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-700">Conversión</p>
              <p className="text-gray-800">{conversion} {monedaDestino}</p>
            </div>
          </div>

          <div className="mb-4 text-sm border p-3 rounded-lg bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Nombre:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>CI:</strong> {user.document_number || "N/A"}
              </p>
              <p>
                <strong>Nacionalidad:</strong> {user.nationality || "N/A"}
              </p>
              <p>
                <strong>KYC:</strong>{" "}
                <span
                  className={
                    user.kyc_status === "active"
                      ? "text-green-600"
                      : "text-orange-600"
                  }
                >
                  {user.kyc_status}
                </span>
              </p>
            </div>
          </div>

          {/* Origen */}
          {isOriginBank ? (
            <SeccionBanco
              label="Cuenta Origen"
              value={cuentaOrigen}
              setValue={setCuentaOrigen}
              options={cuentasOrigen}
              openModal={() => setOpenCuentaOrigen(true)}
              addBtnColor="bg-blue-600 hover:bg-blue-700"
              tipo="origen"
            />
          ) : (
            <>
              <SeccionNoBanco label="¿Cómo pagará sus bolivianos?" />
              {modo === "BOBtoPEN" && nonBankMethod === "qr" && (
                <SeccionBanco
                  label="Cuenta desde la que pagarás (Bolivia)"
                  value={cuentaOrigen}
                  setValue={setCuentaOrigen}
                  options={cuentasOrigen}
                  openModal={() => setOpenCuentaOrigen(true)}
                  addBtnColor="bg-blue-600 hover:bg-blue-700"
                  tipo="origen"
                />
              )}
            </>
          )}

          {/* Destino */}
          {isDestinationBank ? (
            <SeccionBanco
              label="Cuenta Destino"
              value={cuentaDestino}
              setValue={setCuentaDestino}
              options={cuentasDestino}
              openModal={() => setOpenCuentaDestino(true)}
              addBtnColor="bg-green-600 hover:bg-green-700"
              tipo="destino"
            />
          ) : (
            <SeccionNoBanco label="¿Cómo quiere recibir sus bolivianos?" />
          )}

          {/* Juramento + términos */}
          <div className="mb-4 text-xs text-gray-600 flex flex-col gap-2">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={juramento}
                onChange={() => setJuramento(!juramento)}
              />
              <span>Declaro bajo juramento que la información registrada es veraz y exacta.</span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={terminos}
                onChange={() => setTerminos(!terminos)}
              />
              <span>
                Acepto los{" "}
                <a href="/politicas" className="text-blue-600 underline cursor-pointer">
                  Términos y condiciones y la Política de privacidad
                </a>
              </span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row md:justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition w-full md:w-auto"
            >
              Cancelar
            </button>
            <button
              onClick={handleSiguiente}
              className={`bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition w-full md:w-auto ${
                !puedeSeguir ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!puedeSeguir || loading}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}

      <ModalCuentaBancaria
        isOpen={openCuentaOrigen}
        bancos={bancos}
        modo={modo}
        onClose={() => setOpenCuentaOrigen(false)}
        user={user}
        nationality={user.nationality}
        accountType="origin"
        onCuentaGuardada={(data) => {
          const bancoSeleccionado = bancos.find((b) => b.id === data.bank_id);
          const cuentaConBanco = {
            ...data,
            bank_name: bancoSeleccionado?.name || "",
            bank_logo: bancoSeleccionado?.logo_url || "",
            owner_full_name: data.owner_full_name || null,
            owner_document: data.owner_document || null,
            owner_phone: data.owner_phone || null,
          };
          const nuevas = [...cuentasUsuario, cuentaConBanco];
          setCuentasUsuario(nuevas);
          updateCache(user.id, nuevas);
          setCuentaOrigen(cuentaConBanco);
          setOpenCuentaOrigen(false);
        }}
      />

      <ModalCuentaDestino
        isOpen={openCuentaDestino}
        bancos={bancos}
        modo={modo}
        onClose={() => setOpenCuentaDestino(false)}
        user={user}
        nationality={user.nationality}
        accountType="destination"
        onCuentaGuardada={(data) => {
          const bancoSeleccionado = bancos.find((b) => b.id === data.bank_id);
          const cuentaConBanco = {
            ...data,
            bank_name: bancoSeleccionado?.name || "",
            bank_logo: bancoSeleccionado?.logo_url || "",
            owner_full_name: data.owner_full_name || null,
            owner_document: data.owner_document || null,
            owner_phone: data.owner_phone || null,
          };
          const nuevas = [...cuentasUsuario, cuentaConBanco];
          setCuentasUsuario(nuevas);
          updateCache(user.id, nuevas);
          setCuentaDestino(cuentaConBanco);
          setOpenCuentaDestino(false);
        }}
      />

      <ModalTransferencia
        isOpen={openTransferencia}
        onClose={() => setOpenTransferencia(false)}
        user={user}
        tasa={tasa}
        monto={monto}
        conversion={conversion}
        modo={modo}
        modoDescripcion={modoDescripcion}
        cuentaOrigen={cuentaOrigen}
        cuentaDestino={cuentaDestino}
        qrUserAccount={qrUserAccount}
        paymentMethodSlug={nonBankMethod}
        metodosPago={metodosPago}
      />
    </>
  );
}
