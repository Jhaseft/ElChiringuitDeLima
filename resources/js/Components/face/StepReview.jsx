import axios from "axios";
import { Loader2 } from "lucide-react";

export default function StepReview({
  docType,
  docFrontBlob,
  docBackBlob, // Solo para visualización
  videoBlob,
  prevStep,
  loading,
  setLoading,
  resultado,
  setResultado,
}) {
  const handleSubmit = async () => {
    if (!docFrontBlob || !videoBlob)
      return alert("⚠️ Debes capturar documento y video.");

    const formData = new FormData();
    // Solo se envía el frontal
    formData.append("carnet", docFrontBlob, "documento_frente.jpg");
    formData.append("doc_type", docType);
    formData.append("video", videoBlob, "video.webm");

    try {
      setLoading(true);
      const res = await axios.post(
        "https://apiface-production-767c.up.railway.app/registro-face/verify",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResultado(res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Error en la verificación KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <p className="font-semibold text-lg text-center">Revisa tus capturas</p>

      {/* Visualización de documento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {docFrontBlob && (
          <div>
            <p className="text-sm font-medium mb-1">
              {docType === "pasaporte" ? "Pasaporte" : "Anverso"}
            </p>
            <img
              src={URL.createObjectURL(docFrontBlob)}
              alt="Documento anverso"
              className="rounded-lg border shadow w-full h-auto object-cover"
            />
          </div>
        )}

        {docBackBlob && (
          <div>
            <p className="text-sm font-medium mb-1">Reverso</p>
            <img
              src={URL.createObjectURL(docBackBlob)}
              alt="Documento reverso"
              className="rounded-lg border shadow w-full h-auto object-cover opacity-80"
            />
          </div>
        )}
      </div>

      {/* Video selfie */}
      {videoBlob && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Video selfie</p>
          <video
            src={URL.createObjectURL(videoBlob)}
            controls
            className="rounded-lg border shadow w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Botones */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <button
          onClick={prevStep}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Verificar
        </button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-100 shadow-inner">
          <h3 className="font-semibold text-lg mb-2">Resultado de verificación</h3>
          <pre className="text-sm bg-white rounded-md p-2 overflow-auto max-h-60 border">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
