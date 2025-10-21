import { X, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ModalTransferencia({
  isOpen,
  onClose,
  tasa,
  cuentaOrigen,
  cuentaDestino,
  modo,
  modoDescripcion,
  conversion,
  monto,
}) {
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

  const handleUpload = (e) => setComprobante(e.target.files[0]);

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const handleEnviar = async () => {
    if (!comprobante) {
      setError("Por favor, sube un comprobante.");
      return;
    }

    if (!cuentaOrigen?.id || !cuentaDestino?.id || !monto || !conversion) {
      setError("Faltan datos de la operación (cuentas, monto o tipo de cambio).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("origin_account_id", cuentaOrigen.id);
      formData.append("destination_account_id", cuentaDestino.id);
      formData.append("amount", monto);
      formData.append("exchange_rate", tasa);
      formData.append("converted_amount", conversion);
      formData.append("comprobante", comprobante);
      formData.append("modo", modo);

      const res = await fetch("/operacion/crear-transferencia", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al guardar la transferencia.");

      await res.json();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Error al enviar la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Configuración escalable
  const transferOptions = {
    BOBtoPEN: [
      {
        type: "qr",
        title: "QR Bolivia",
        image:
          "https://res.cloudinary.com/dnbklbswg/image/upload/v1756359417/qr_hgokvi.jpg",
      },
    ],
    PENtoBOB: [
      {
        type: "Yape",
        title: "Yape Perú",
        number: "947847817",
        image:
          "https://res.cloudinary.com/dnbklbswg/image/upload/v1756359619/yape-logo-png_seeklogo-504685_tns3su.png",
      },
      {
        type: "Plin",
        title: "Plin Perú",
        number: "947847817",
        image:
          "https://res.cloudinary.com/dnbklbswg/image/upload/v1756359595/plin_fi3i8u.png",
      },
      {
        type: "InterBank",
        title: "InterBank Perú",
        number: "4403006144735",
        image:
          "https://res.cloudinary.com/dnbklbswg/image/upload/v1756305466/download_zxsiny.png",
      },
       {
        type: "InterBank",
        title: "BCP Perú",
        number: "2207063622037  ",
        image:
          "https://res.cloudinary.com/dnbklbswg/image/upload/v1756304903/bcp_mtkdyl.png",
      },
    ],
  };

  const opciones = transferOptions[modo] || [];
  const isBOBtoPEN = modo === "BOBtoPEN";

  const montoTexto = isBOBtoPEN ? `${monto} BOB` : `${monto} PEN`;
  const conversionTexto = isBOBtoPEN ? `${conversion} PEN` : `${conversion} BOB`;

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

            {/* Resumen */}
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
                  <tr>
                    <td className="font-semibold pr-2">Cuenta origen:</td>
                    <td>
                      {cuentaOrigen?.bank_name} - {cuentaOrigen?.account_number}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Cuenta destino:</td>
                    <td>
                      {cuentaDestino?.bank_name} - {cuentaDestino?.account_number}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mensaje central */}
            <div className="text-center mb-6">
              <p className="font-semibold mb-2">
                Por favor, realiza el depósito del monto de{" "}
                <span className="text-green-600">{montoTexto}</span>
              </p>

              {/* Render dinámico */}
              <div className="flex flex-col gap-4 mt-4 items-center">
                {opciones.map((op, idx) => {
                  if (op.type === "qr") {
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <p className="font-semibold">Escanea el QR para transferir</p>
                        <div className="bg-white p-2 rounded-lg shadow">
                          <img
                            src={op.image}
                            alt={op.title}
                            className="w-40 h-40 object-contain"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
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
                  );
                })}
              </div>
            </div>

            {/* Subir comprobante */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Subir comprobante
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleUpload}
                className="w-full text-sm"
              />
              {comprobante && (
                <p className="text-xs text-green-600 mt-1">
                  Archivo cargado: {comprobante.name}
                </p>
              )}
            </div>

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

            {/* Botones */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
              >
                Atrás
              </button>
              <button
                onClick={handleEnviar}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                Enviar Comprobante
              </button>
            </div>
          </>
        ) : (
          // ✅ Mensaje de éxito
          <div className="flex flex-col items-center justify-center text-center py-8">
            <CheckCircle2 className="text-green-600 mb-3" size={48} />
            <h3 className="text-lg font-bold text-gray-800">
              ¡Transferencia registrada con éxito!
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Recibirá un correo con el comprobante en breve.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
            >
              Entendido
            </button>
          </div>
        )}
      </div>

      {/* Overlay de carga */}
      {loading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/60">
          <Loader2 className="animate-spin text-white mb-4" size={48} />
          <p className="text-white font-semibold text-lg">
            Procesando su operación...
          </p>
          <p className="text-gray-300 text-sm mt-1">
            Estamos registrando la transferencia y enviando el correo
          </p>
        </div>
      )}
    </div>
  );
}
