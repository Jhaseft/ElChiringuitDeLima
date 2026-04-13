import { useState, useEffect } from "react";
import { X, QrCode, Upload, RefreshCw, ChevronLeft, Copy } from "lucide-react";
import StatusMessage from "@/Components/ui/StatusMessage";

// Opciones de pago de la empresa según modo (igual que ModalTransferencia)
const OPCIONES_PAGO = {
    BOBtoPEN: [
        {
            type: "qr",
            title: "QR Bolivia",
            image: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756359417/qr_hgokvi.jpg",
        },
    ],
    PENtoBOB: [
        {
            type: "Yape",
            title: "Yape Perú",
            number: "947847817",
            image: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756359619/yape-logo-png_seeklogo-504685_tns3su.png",
        },
        {
            type: "Plin",
            title: "Plin Perú",
            number: "947847817",
            image: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756359595/plin_fi3i8u.png",
        },
        {
            type: "InterBank",
            title: "InterBank Perú",
            number: "4403006144735",
            image: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756305466/download_zxsiny.png",
        },
        {
            type: "BCP",
            title: "BCP Perú",
            number: "2207063622037",
            image: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756304903/bcp_mtkdyl.png",
        },
    ],
};

const paisPorModo = { PENtoBOB: "PE", BOBtoPEN: "BO" };

export default function ModalQR({
    isOpen,
    onClose,
    user,
    monto,
    conversion,
    tasa,
    modo,
    modoDescripcion,
}) {
    const [paso, setPaso] = useState(1); // 1 = QR usuario, 2 = pago + comprobante

    // ── cuentas QR del usuario ────────────────────────────────
    const [cuentaQR, setCuentaQR]           = useState(null);
    const [loadingCuenta, setLoadingCuenta] = useState(false);

    // ── subida imagen QR ──────────────────────────────────────
    const [imagenQR, setImagenQR]         = useState(null);
    const [subiendoQR, setSubiendoQR]     = useState(false);
    const [errorQR, setErrorQR]           = useState("");
    const [mostrarCambiar, setMostrarCambiar] = useState(false);

    // ── comprobante de pago ───────────────────────────────────
    const [comprobante, setComprobante] = useState(null);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");
    const [success, setSuccess]         = useState(false);

    const csrfToken  = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    const qrCountry  = paisPorModo[modo] ?? "PE";
    const opciones   = OPCIONES_PAGO[modo] ?? [];
    const isBOBtoPEN = modo === "BOBtoPEN";
    const montoTexto      = isBOBtoPEN ? `${monto} BOB` : `${monto} PEN`;
    const conversionTexto = isBOBtoPEN ? `${conversion} PEN` : `${conversion} BOB`;

    // ── fetch cuenta QR al abrir ──────────────────────────────
    useEffect(() => {
        if (!isOpen || !user) return;

        setPaso(1);
        setLoadingCuenta(true);
        setCuentaQR(null);
        setMostrarCambiar(false);
        setImagenQR(null);
        setErrorQR("");
        setError("");
        setSuccess(false);
        setComprobante(null);

        fetch(`/operacion/listar-cuentas/${user.id}/qr`)
            .then((r) => r.json())
            .then((data) => {
                const encontrada = data.find((c) => c.qr_country === qrCountry);
                setCuentaQR(encontrada ?? null);
            })
            .catch(() => setCuentaQR(null))
            .finally(() => setLoadingCuenta(false));
    }, [isOpen, user, modo]);

    if (!isOpen) return null;

    // ── subir QR del usuario ──────────────────────────────────
    const handleGuardarQR = async () => {
        if (!imagenQR) { setErrorQR("Selecciona una imagen."); return; }
        setSubiendoQR(true);
        setErrorQR("");
        try {
            const fd = new FormData();
            fd.append("user_id", user.id);
            fd.append("method_type", "qr");
            fd.append("qr_country", qrCountry);
            fd.append("qr_image", imagenQR);

            const res = await fetch("/operacion/guardar-cuenta", {
                method: "POST",
                headers: { "X-CSRF-TOKEN": csrfToken, Accept: "application/json" },
                body: fd,
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al guardar el QR.");
            }
            const cuenta = await res.json();
            setCuentaQR({ id: cuenta.id, qr_value: cuenta.qr_value, qr_country: cuenta.qr_country });
            setMostrarCambiar(false);
            setImagenQR(null);
        } catch (err) {
            setErrorQR(err.message || "Error al guardar el QR.");
        } finally {
            setSubiendoQR(false);
        }
    };

    // ── enviar operación ──────────────────────────────────────
    const handleEnviar = async () => {
        if (!comprobante) { setError("Sube el comprobante del pago."); return; }
        setLoading(true);
        setError("");
        try {
            const fd = new FormData();
            fd.append("amount", monto);
            fd.append("modo", modo);
            fd.append("comprobante", comprobante);
            fd.append("payment_method_slug", "qr");
            fd.append("destination_account_id", cuentaQR.id);

            const res = await fetch("/operacion/crear-transferencia", {
                method: "POST",
                headers: { "X-CSRF-TOKEN": csrfToken, Accept: "application/json" },
                body: fd,
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al registrar la operación.");
            }
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Error al enviar el comprobante.");
        } finally {
            setLoading(false);
        }
    };

    // ── resumen operación (compartido) ────────────────────────
    const ResumenOperacion = () => (
        <div className="border rounded-lg bg-gray-50 p-3 text-sm">
            <table className="w-full">
                <tbody>
                    <tr>
                        <td className="font-semibold pr-2 py-0.5">Conversión:</td>
                        <td>{modoDescripcion}</td>
                    </tr>
                    <tr>
                        <td className="font-semibold pr-2 py-0.5">Monto a enviar:</td>
                        <td>{montoTexto}</td>
                    </tr>
                    <tr>
                        <td className="font-semibold pr-2 py-0.5">Monto a recibir:</td>
                        <td className="text-green-600 font-semibold">{conversionTexto}</td>
                    </tr>
                    <tr>
                        <td className="font-semibold pr-2 py-0.5">Tipo de cambio:</td>
                        <td>{tasa}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-2">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[92vh] overflow-y-auto mt-10">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition z-10"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>

                {!success ? (
                    <div className="flex flex-col gap-4">

                        {/* Header con indicador de pasos */}
                        <div>
                            <h2 className="text-lg font-bold text-center text-gray-800">Pago por QR</h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${paso === 1 ? "bg-blue-600 text-white" : "bg-green-500 text-white"}`}>1</div>
                                <div className={`h-0.5 w-10 ${paso === 2 ? "bg-blue-600" : "bg-gray-300"}`} />
                                <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${paso === 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-500"}`}>2</div>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-1">
                                {paso === 1 ? "Tu QR de cobro" : "Realizar pago"}
                            </p>
                        </div>

                        <ResumenOperacion />

                        {/* ═══════════════════════════════════════ */}
                        {/* PASO 1 — QR del usuario                 */}
                        {/* ═══════════════════════════════════════ */}
                        {paso === 1 && (
                            <>
                                <div className="border rounded-lg p-4 flex flex-col gap-3">
                                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <QrCode size={16} />
                                        Tu QR para recibir en {qrCountry === "PE" ? "Perú (Soles)" : "Bolivia (Bolivianos)"}
                                    </p>

                                    {loadingCuenta ? (
                                        <p className="text-xs text-gray-400 text-center py-4 animate-pulse">Verificando tu QR...</p>
                                    ) : cuentaQR && !mostrarCambiar ? (
                                        // Ya tiene QR
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="bg-white p-2 rounded-xl shadow border">
                                                <img
                                                    src={cuentaQR.qr_value}
                                                    alt="Tu QR"
                                                    className="w-36 h-36 object-contain"
                                                />
                                            </div>
                                            <p className="text-xs text-green-600 font-semibold">QR guardado</p>
                                            <button
                                                onClick={() => { setMostrarCambiar(true); setImagenQR(null); setErrorQR(""); }}
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                            >
                                                <RefreshCw size={12} /> Cambiar QR
                                            </button>
                                        </div>
                                    ) : (
                                        // Sin QR o cambiando
                                        <div className="flex flex-col gap-2">
                                            <p className="text-xs text-gray-500">
                                                {mostrarCambiar
                                                    ? "Sube la nueva imagen de tu QR."
                                                    : "No tienes un QR guardado. Sube la imagen de tu QR para continuar."}
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg"
                                                onChange={(e) => setImagenQR(e.target.files[0])}
                                                className="w-full text-sm"
                                            />
                                            {imagenQR && (
                                                <p className="text-xs text-gray-500">Archivo: {imagenQR.name}</p>
                                            )}
                                            {errorQR && <p className="text-xs text-red-600">{errorQR}</p>}
                                            <div className="flex items-center gap-2">
                                                {mostrarCambiar && (
                                                    <button
                                                        onClick={() => setMostrarCambiar(false)}
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

                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={onClose}
                                        className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => setPaso(2)}
                                        disabled={!cuentaQR || mostrarCambiar}
                                        className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* PASO 2 — QR empresa + comprobante       */}
                        {/* ═══════════════════════════════════════ */}
                        {paso === 2 && (
                            <>
                                {/* Opciones de pago de la empresa */}
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm font-semibold text-gray-700 text-center">
                                        Por favor, realiza el depósito de{" "}
                                        <span className="text-green-600">{montoTexto}</span>
                                    </p>
                                    <div className="flex flex-col gap-3 w-full">
                                        {opciones.map((op, idx) => {
                                            if (op.type === "qr") {
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-2">
                                                        <p className="text-sm font-semibold">Escanea el QR para transferir</p>
                                                        <div className="bg-white p-3 rounded-xl shadow border">
                                                            <img src={op.image} alt={op.title} className="w-48 h-48 object-contain" />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div key={idx} className="flex items-center gap-3 border rounded-lg p-3 shadow-sm w-full">
                                                    <img src={op.image} alt={op.title} className="w-12 h-12 object-contain flex-shrink-0" />
                                                    <div className="text-left text-sm flex-1">
                                                        <p className="font-bold text-gray-800">{op.title}</p>
                                                        <p className="flex items-center gap-2">
                                                            Número: <span className="font-mono">{op.number}</span>
                                                            <button
                                                                onClick={() => navigator.clipboard.writeText(op.number)}
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

                                {/* Comprobante */}
                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        Subir captura del pago QR
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setComprobante(e.target.files[0])}
                                        className="w-full text-sm"
                                    />
                                    {comprobante && (
                                        <p className="text-xs text-green-600 mt-1">Archivo: {comprobante.name}</p>
                                    )}
                                </div>

                                {error && <p className="text-xs text-red-600">{error}</p>}

                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setPaso(1)}
                                        className="flex items-center gap-1 border border-gray-300 text-gray-600 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                                    >
                                        <ChevronLeft size={16} /> Atrás
                                    </button>
                                    <button
                                        onClick={handleEnviar}
                                        disabled={loading || !comprobante}
                                        className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Enviar Comprobante
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="p-2">
                        <StatusMessage
                            type="success"
                            title="¡Operación registrada con éxito!"
                            description="Recibirás un correo con el detalle en breve."
                            onClose={onClose}
                        />
                    </div>
                )}
            </div>

            {(loading || subiendoQR) && (
                <StatusMessage
                    type="loading"
                    title={subiendoQR ? "Subiendo tu QR..." : "Procesando operación..."}
                    description={subiendoQR ? "Guardando imagen en el servidor." : "Estamos registrando tu pago QR."}
                />
            )}
        </div>
    );
}
