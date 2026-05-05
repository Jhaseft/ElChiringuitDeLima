import { X, Copy, ImagePlus } from "lucide-react";
import { useState, useRef } from "react";
import StatusMessage from "@/Components/ui/StatusMessage";

export default function ModalTransferencia({
  isOpen,
  onClose,
  tasa,
  cuentaOrigen,
  cuentaDestino,
  qrUserAccount,
  paymentMethodSlug, // 'cash' | 'qr'
  modo,
  modoDescripcion,
  conversion,
  monto,
  metodosPago,
}) {
  const [comprobantes, setComprobantes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

  const isBOBtoPEN = modo === "BOBtoPEN";
  const comprobanteOpcional = isBOBtoPEN && paymentMethodSlug === "cash";
  const montoTexto = isBOBtoPEN ? `${monto} BOB` : `${monto} PEN`;
  const conversionTexto = isBOBtoPEN ? `${conversion} PEN` : `${conversion} BOB`;

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const total = comprobantes.length + files.length;
    if (total > 5) {
      setError("Máximo 5 comprobantes.");
      return;
    }
    setError("");
    setComprobantes((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : null
    );
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index) => {
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    setComprobantes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const handleEnviar = async () => {
    if (!comprobanteOpcional && comprobantes.length === 0) {
      setError("Por favor, sube al menos un comprobante.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("amount", monto);
      formData.append("modo", modo);

      // payment_method_slug = cómo NOSOTROS entregamos al cliente
      //   PENtoBOB → cash | qr (según destino elegido)
      //   BOBtoPEN → bank_transfer (siempre, le depositamos a su cuenta PE)
      const slugEnvio =
        modo === "PENtoBOB" ? paymentMethodSlug : "bank_transfer";
      formData.append("payment_method_slug", slugEnvio);

      if (modo === "PENtoBOB") {
        formData.append("origin_account_id", cuentaOrigen?.id ?? "");
        if (paymentMethodSlug === "qr" && qrUserAccount?.id) {
          formData.append("destination_account_id", qrUserAccount.id);
        }
      } else {
        // BOBtoPEN
        formData.append("destination_account_id", cuentaDestino?.id ?? "");
        if (paymentMethodSlug === "qr" && cuentaOrigen?.id) {
          formData.append("origin_account_id", cuentaOrigen.id);
        }
      }

      comprobantes.forEach((file) => formData.append("comprobantes[]", file));

      const res = await fetch("/operacion/crear-transferencia", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, Accept: "application/json" },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al guardar la transferencia.");
      }

      await res.json();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al enviar la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  // ── opciones de pago de la empresa para el modo actual ─────
  const opcionesEmpresa = metodosPago.filter((m) => m.currency_pair === modo);

  // ── sección de depósito según modo + slug ──────────────────
  let depositoSection;

  if (modo === "BOBtoPEN" && paymentMethodSlug === "cash") {
    depositoSection = (
      <div className="border rounded-lg bg-yellow-50 border-yellow-300 p-4 text-sm text-gray-800">
        <p className="font-semibold mb-1">Pago en oficina</p>
        <p>
          Si ya pagaste en nuestra oficina, toma una foto del comprobante que
          recibiste y súbelo aquí para registrar tu operación.
        </p>
      </div>
    );
  } else if (modo === "BOBtoPEN" && paymentMethodSlug === "qr") {
    const qrEmpresa = opcionesEmpresa.find((m) => m.type === "qr");
    depositoSection = (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">Escanea el QR para pagar</p>
        {qrEmpresa ? (
          <div className="bg-white p-2 rounded-lg shadow border">
            <img
              src={qrEmpresa.image}
              alt={qrEmpresa.title}
              className="md:w-40 md:h-40 w-60 h-60 object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-red-600">No hay QR de la empresa configurado.</p>
        )}
      </div>
    );
  } else {
    // PENtoBOB → cliente paga por banco PE → mostrar cuentas bancarias de la empresa
    const bankOps = opcionesEmpresa.filter((m) => m.type !== "qr");
    depositoSection = (
      <div className="flex flex-col gap-4 mt-4 items-center">
        {bankOps.length === 0 && (
          <p className="text-sm text-red-600">
            No hay cuentas de la empresa configuradas para este modo.
          </p>
        )}
        {bankOps.map((op, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 border rounded-lg p-3 shadow-sm w-full"
          >
            <div className="flex-shrink-0">
              <img
                src={op.image}
                alt={op.title}
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
            </div>
            <div className="text-left text-sm flex-1">
              <p className="font-bold text-gray-800">{op.title}</p>
              <p className="flex items-center gap-2">
                Número: <span className="font-mono">{op.number}</span>
                <button
                  onClick={() => copyToClipboard(op.number)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy size={14} />
                </button>
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── filas resumen según modo + slug ────────────────────────
  const renderResumenCuentas = () => {
    if (modo === "PENtoBOB") {
      const destinoLabel =
        paymentMethodSlug === "cash"
          ? "Efectivo en oficina (BOB)"
          : paymentMethodSlug === "qr"
            ? "Tu QR (BOB)"
            : "—";
      return (
        <>
          <tr>
            <td className="font-semibold pr-2">Cuenta origen:</td>
            <td>
              {cuentaOrigen?.bank_name} - {cuentaOrigen?.account_number}
            </td>
          </tr>
          <tr>
            <td className="font-semibold pr-2">Recibirás en:</td>
            <td>{destinoLabel}</td>
          </tr>
        </>
      );
    }
    // BOBtoPEN
    const origenLabel =
      paymentMethodSlug === "cash"
        ? "Efectivo en oficina (BOB)"
        : paymentMethodSlug === "qr"
          ? "QR de la empresa (BOB)"
          : "—";
    return (
      <>
        <tr>
          <td className="font-semibold pr-2">Pagarás con:</td>
          <td>{origenLabel}</td>
        </tr>
        {paymentMethodSlug === "qr" && cuentaOrigen && (
          <tr>
            <td className="font-semibold pr-2">Cuenta origen:</td>
            <td>
              {cuentaOrigen?.bank_name} - {cuentaOrigen?.account_number}
            </td>
          </tr>
        )}
        <tr>
          <td className="font-semibold pr-2">Cuenta destino:</td>
          <td>
            {cuentaDestino?.bank_name} - {cuentaDestino?.account_number}
          </td>
        </tr>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-2">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto mt-11">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        {!success ? (
          <>
            <h2 className="text-lg md:text-xl font-bold mb-6 text-center text-gray-800">
              Registro de Transferencia
            </h2>

            <div className="border rounded-lg bg-gray-50 p-4 mb-4 text-sm">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-semibold pr-2">Conversión:</td>
                    <td>{modoDescripcion}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Monto a enviar:</td>
                    <td>{montoTexto}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Monto a recibir:</td>
                    <td>{conversionTexto}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Tipo de cambio:</td>
                    <td>{tasa}</td>
                  </tr>
                  {renderResumenCuentas()}
                </tbody>
              </table>
            </div>

            <div className="text-center mb-6">
              <p className="font-semibold mb-2">
                {modo === "BOBtoPEN" && paymentMethodSlug === "cash"
                  ? <>Confirma tu pago en oficina por <span className="text-green-600">{montoTexto}</span></>
                  : <>Por favor, realiza el depósito de <span className="text-green-600">{montoTexto}</span></>}
              </p>

              <div className="mt-4">{depositoSection}</div>
            </div>

            {!comprobanteOpcional && (
              
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Subir comprobantes{" "}
                  <span className="text-gray-400 font-normal">(máx. 5)</span>
                </label>

                {comprobantes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {comprobantes.map((file, idx) => (
                      <div key={idx} className="relative group w-20 h-20">
                        {previews[idx] ? (
                          <img
                            src={previews[idx]}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-500 text-center p-1">
                            PDF
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {comprobantes.length < 5 && (
                  <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition text-sm text-gray-500">
                    <ImagePlus size={18} />
                    {comprobantes.length === 0 ? "Seleccionar comprobantes" : "Agregar más"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
              >
                Atrás
              </button>
              <button
                onClick={handleEnviar}
                disabled={loading || (!comprobanteOpcional && comprobantes.length === 0)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {comprobanteOpcional && comprobantes.length === 0
                  ? "Confirmar operación"
                  : "Enviar Comprobante"}
              </button>
            </div>
          </>
        ) : (
          <StatusMessage
            type="success"
            title="¡Transferencia registrada con éxito!"
            description="Recibirá un correo con el comprobante en breve."
            onClose={onClose}
          />
        )}
      </div>

      {loading && (
        <StatusMessage
          type="loading"
          title="Procesando su operación..."
          description="Estamos registrando la transferencia y enviando el correo"
        />
      )}
    </div>
  );
}
