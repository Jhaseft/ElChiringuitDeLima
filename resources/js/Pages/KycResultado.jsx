import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";

export default function KycResultado() {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;

    const [status, setStatus] = useState(user?.kyc_status ?? null);
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        if (user) {
            setStatus(user.kyc_status);
            setLoading(false);
        }
    }, [user]);

    const handleContinuar = () => {
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 text-center">

              
                {loading && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600">Cargando...</p>
                    </div>
                )}

              
                {!loading && status === "pending" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-4xl">⏳</div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Verificación en proceso
                        </h2>
                        <p className="text-gray-500">
                            Estamos validando tu identidad...
                        </p>
                    </div>
                )}
            
                {!loading && status === "verified" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-5xl">✅</div>
                        <h2 className="text-xl font-semibold text-green-600">
                            KYC aprobado
                        </h2>
                        <p className="text-gray-500">
                            Tu identidad fue verificada correctamente.
                        </p>

                        <button
                            onClick={handleContinuar}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {!loading && status === "rejected" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-5xl">❌</div>
                        <h2 className="text-xl font-semibold text-red-600">
                            KYC rechazado
                        </h2>
                        <p className="text-gray-500">
                            No pudimos validar tu identidad.
                        </p>

                        <button
                            onClick={() => (window.location.href = "/kyc")}
                            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}