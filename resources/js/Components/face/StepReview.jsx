import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function StepReview({
  docType,
  docFrontBlob,
  docBackBlob,
  videoBlob,
  prevStep,
  loading,
  setLoading,
  resultado,
  setResultado,
}) {
  const [frontURL, setFrontURL] = useState(null);
  const [backURL, setBackURL] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  // Crear y limpiar ObjectURLs
  useEffect(() => {
    mountedRef.current = true;

    if (docFrontBlob) {
      const url = URL.createObjectURL(docFrontBlob);
      setFrontURL(url);
    }
    if (docBackBlob) {
      const url = URL.createObjectURL(docBackBlob);
      setBackURL(url);
    }
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoURL(url);
    }

    return () => {
      mountedRef.current = false;
      if (frontURL) URL.revokeObjectURL(frontURL);
      if (backURL) URL.revokeObjectURL(backURL);
      if (videoURL) URL.revokeObjectURL(videoURL);
    };
  }, [docFrontBlob, docBackBlob, videoBlob]);

  const handleVerify = async () => {
    setError(null);
    setResultado(null);

    // Validación: que existan blobs
    if (!docFrontBlob || !docBackBlob || !videoBlob) {
      setError("Faltan archivos por subir.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("tipoDocumento", docType);
      formData.append("anverso", docFrontBlob, "front.jpg");
      formData.append("reverso", docBackBlob, "back.jpg");
      formData.append("video", videoBlob, "video.mp4");

      const response = await axios.post("/api/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (mountedRef.current) {
        setResultado(response.data);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError("Error en la verificación. Intenta nuevamente.");
        console.error(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-center">Revisión del Documento</h2>

      {/* Vista previa de imágenes */}
      <div className="grid grid-cols-2 gap-4">
        {frontURL && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Anverso</p>
            <img
              src={frontURL}
              alt="Anverso"
              className="rounded-lg shadow-md w-full object-cover"
              onError={() => setError("Error cargando la imagen del anverso.")}
            />
          </div>
        )}
        {backURL && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Reverso</p>
            <img
              src={backURL}
              alt="Reverso"
              className="rounded-lg shadow-md w-full object-cover"
              onError={() => setError("Error cargando la imagen del reverso.")}
            />
          </div>
        )}
      </div>

      {/* Vista previa de video */}
      {videoURL && (
        <div>
          <p className="text-sm text-gray-600 mb-1">Video</p>
          <video
            src={videoURL}
            controls
            className="rounded-lg shadow-md w-full"
            onError={() => setError("Error cargando el video.")}
          />
        </div>
      )}

      {/* Mensajes de error */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Resultado de verificación */}
      {resultado && (
        <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-700 font-medium">
            {JSON.stringify(resultado)}
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
        >
          Volver
        </button>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-4 py-2 flex items-center gap-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Verificando...
            </>
          ) : (
            "Verificar"
          )}
        </button>
      </div>
    </div>
  );
}
