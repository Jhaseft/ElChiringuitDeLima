import { Button } from "@/Components/ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function StepReview({ carnetBlob, videoBlob, prevStep, loading, setLoading, resultado, setResultado }) {
  const handleSubmit = async () => {
    if (!carnetBlob || !videoBlob) return alert("⚠️ Debes capturar foto y video.");
    const formData = new FormData();
    formData.append("carnet", carnetBlob, "carnet.jpg");
    formData.append("video", videoBlob, "video.webm");

    try {
      setLoading(true);
      const res = await axios.post("https://apiface-production-767c.up.railway.app/registro-face/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

      {carnetBlob && (
        <img
          src={URL.createObjectURL(carnetBlob)}
          alt="Carnet"
          className="rounded-lg border shadow w-full max-w-sm sm:max-w-md md:max-w-lg h-auto object-cover mx-auto"
        />
      )}
      {videoBlob && (
        <video
          src={URL.createObjectURL(videoBlob)}
          controls
          className="rounded-lg border shadow w-full max-w-sm sm:max-w-md md:max-w-lg h-auto object-cover mx-auto mt-2"
        />
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <Button onClick={prevStep} className="bg-gray-400 hover:bg-gray-500">Atrás</Button>
        <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : "Enviar a API"}
        </Button>
      </div>

      {resultado && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-100 shadow-inner">
          <h3 className="font-semibold text-lg mb-2">Resultado de verificación</h3>
          <pre className="text-sm bg-white rounded-md p-2 overflow-auto max-h-40 border">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
