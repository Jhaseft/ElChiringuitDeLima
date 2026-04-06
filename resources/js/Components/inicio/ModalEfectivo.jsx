import { useState } from "react";
import { X, Copy, MapPin } from "lucide-react";
import StatusMessage from "@/Components/ui/StatusMessage";

const OFICINAS = [
    {
        nombre: "Oficina La Paz",
        direccion: "Av. 16 de Julio #1234, El Prado",
        horario: "Lun–Vie 9:00–18:00 | Sáb 9:00–13:00",
        imagen: "https://res.cloudinary.com/dxa8nat3p/image/upload/v1774708728/Logo_y_Texto_wvkwil.png",
    },
    {
        nombre: "Oficina Lima",
        direccion: "Jr. de la Unión 456, Centro de Lima",
        horario: "Lun–Vie 9:00–18:00 | Sáb 9:00–13:00",
        imagen: "https://res.cloudinary.com/dxa8nat3p/image/upload/v1774708728/Logo_y_Texto_wvkwil.png",
    },
];

const CUENTAS_DESTINO = {
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
    BOBtoPEN: [
        {
            type: "qr",
            title: "QR Bolivia",
            image: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756359417/qr_hgokvi.jpg",
        },
    ],
};

export default function ModalEfectivo({ isOpen, onClose, user, monto, conversion, tasa, modo, modoDescripcion }) {
    const [comprobante, setComprobante] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    const isBOBtoPEN = modo === "BOBtoPEN";
    const montoTexto = isBOBtoPEN ? `${monto} BOB` : `${monto} PEN`;
    const conversionTexto = isBOBtoPEN ? `${conversion} PEN` : `${conversion} BOB`;
    const opciones = CUENTAS_DESTINO[modo] || [];

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    const handleEnviar = async () => {
        if (!comprobante) {
            setError("Por favor, sube un comprobante.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("amount", monto);
            formData.append("modo", modo);
            formData.append("comprobante", comprobante);
            formData.append("payment_method_slug", "cash");

            const res = await fetch("/operacion/crear-transferencia", {
                method: "POST",
                headers: { "X-CSRF-TOKEN": csrfToken, Accept: "application/json" },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al guardar la transferencia.");
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message || "Error al enviar la transferencia.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-2">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative max-h-[92vh] overflow-y-auto mt-10">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition z-10"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>

                {!success ? (
                    <div className="flex flex-col md:flex-row">

                        {/* ── Columna izquierda: oficinas ── */}
                        <div className="md:w-2/5 bg-gray-900 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none p-5 flex flex-col gap-5">
                            <h3 className="text-yellow-400 font-bold text-base text-center">
                                Nuestras Oficinas
                            </h3>

                            {OFICINAS.map((of, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="rounded-xl overflow-hidden border border-yellow-400/30 h-32 bg-gray-800 flex items-center justify-center">
                                        <img
                                            src={of.imagen}
                                            alt={of.nombre}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-sm text-gray-200">
                                        <p className="font-semibold text-yellow-400 flex items-center gap-1">
                                            <MapPin size={13} /> {of.nombre}
                                        </p>
                                        <p className="text-gray-300 text-xs mt-0.5">{of.direccion}</p>
                                        <p className="text-gray-400 text-xs">{of.horario}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Columna derecha: operación ── */}
                        <div className="md:w-3/5 p-6 flex flex-col gap-4">
                            <h2 className="text-lg font-bold text-center text-gray-800">
                                Operación en Efectivo
                            </h2>

                            {/* Resumen operación */}
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

                            {/* Resumen usuario */}
                            <div className="border rounded-lg bg-blue-50 p-3 text-sm grid grid-cols-2 gap-1">
                                <p><strong>Nombre:</strong> {user?.first_name} {user?.last_name}</p>
                                <p><strong>CI:</strong> {user?.document_number || "N/A"}</p>
                                <p><strong>Nacionalidad:</strong> {user?.nationality || "N/A"}</p>
                                <p>
                                    <strong>KYC:</strong>{" "}
                                    <span className={user?.kyc_status === "active" ? "text-green-600" : "text-orange-600"}>
                                        {user?.kyc_status}
                                    </span>
                                </p>
                            </div>

                            {/* Cuentas o QR según modo */}
                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-semibold text-gray-700">
                                    {isBOBtoPEN ? "Escanea el QR para transferir" : "Realiza el depósito a:"}
                                </p>

                                {opciones.map((op, idx) => {
                                    if (op.type === "qr") {
                                        return (
                                            <div key={idx} className="flex justify-center">
                                                <div className="bg-white p-2 rounded-lg shadow border">
                                                    <img src={op.image} alt={op.title} className="w-40 h-40 object-contain" />
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={idx} className="flex items-center gap-3 border rounded-lg p-3 shadow-sm">
                                            <img src={op.image} alt={op.title} className="w-12 h-12 object-contain flex-shrink-0" />
                                            <div className="text-sm flex-1">
                                                <p className="font-bold text-gray-800">{op.title}</p>
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    Número: <span className="font-mono">{op.number}</span>
                                                    <button onClick={() => copyToClipboard(op.number)} className="text-blue-600 hover:text-blue-800">
                                                        <Copy size={13} />
                                                    </button>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Comprobante */}
                            <div>
                                <label className="block text-sm font-semibold mb-1">Subir comprobante</label>
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
                                    onClick={onClose}
                                    className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEnviar}
                                    disabled={loading}
                                    className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    Enviar Comprobante
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <StatusMessage
                            type="success"
                            title="¡Operación registrada con éxito!"
                            description="Recibirás un correo con el detalle en breve."
                            onClose={onClose}
                        />
                    </div>
                )}
            </div>

            {loading && (
                <StatusMessage
                    type="loading"
                    title="Procesando operación..."
                    description="Estamos registrando tu transferencia en efectivo."
                />
            )}
        </div>
    );
}
