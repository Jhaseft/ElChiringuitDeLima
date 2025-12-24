import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function DocumentUpload({
  docType,
  docFrontFile,
  docBackFile,
  videoFile,
  setDocFrontFile,
  setDocBackFile,
  setVideoFile,
  loading,
  setLoading,
  resultado,
  setResultado,
  onBack,
}) {
  const requiereReverso = docType === "ci" || docType === "licencia";

  const [message, setMessage] = useState(null);
  const [problems, setProblems] = useState([]);

  const [frontURL, setFrontURL] = useState(null);
  const [backURL, setBackURL] = useState(null);
  const [videoURL, setVideoURL] = useState(null);

  const [loadedFront, setLoadedFront] = useState(false);
  const [loadedBack, setLoadedBack] = useState(false);
  const [loadedVideo, setLoadedVideo] = useState(false);

  /* =======================
     Previews + cleanup
  ======================= */
  useEffect(() => {
    let front, back, video;

    if (docFrontFile) front = URL.createObjectURL(docFrontFile);
    if (docBackFile) back = URL.createObjectURL(docBackFile);
    if (videoFile) video = URL.createObjectURL(videoFile);

    setFrontURL(front || null);
    setBackURL(back || null);
    setVideoURL(video || null);

    setLoadedFront(false);
    setLoadedBack(false);
    setLoadedVideo(false);

    return () => {
      if (front) URL.revokeObjectURL(front);
      if (back) URL.revokeObjectURL(back);
      if (video) URL.revokeObjectURL(video);
    };
  }, [docFrontFile, docBackFile, videoFile]);

  const getCsrfToken = () => {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el?.getAttribute("content") || "";
  };

  /* =======================
     SUBMIT 
  ======================= */
  const handleSubmit = async () => {
  if (!docFrontFile || !videoFile) {
    alert("⚠️ Debes subir documento frontal y video.");
    return;
  }

  if (requiereReverso && !docBackFile) {
    alert("⚠️ Debes subir también el reverso.");
    return;
  }

  if (!(loadedFront && (requiereReverso ? loadedBack : true) && loadedVideo)) {
    alert("⚠️ Espera a que todos los archivos se carguen.");
    return;
  }

  try {
    setLoading(true);
    setMessage(null);
    setProblems([]);

    // ===== 1️ Revisar FormData KYC =====
    const formDataKyc = new FormData();
    formDataKyc.append("carnet", docFrontFile, "documento_frente.jpg");
    if (docBackFile) formDataKyc.append("carnet_back", docBackFile, "documento_reverso.jpg");
    formDataKyc.append("doc_type", docType);
    formDataKyc.append("video", videoFile, "video.mp4");

    console.log("=== Enviando KYC ===");
    for (let pair of formDataKyc.entries()) {
      console.log(pair[0], pair[1]);
    }

    const kycRes = await axios.post("/kyc-proxy", formDataKyc);


    console.log("=== Respuesta KYC ===", kycRes.data);
    setResultado(kycRes.data);

    // ===== 2️ Backend interno =====
    const csrf = getCsrfToken();
    const formDataBackend = new FormData();
    formDataBackend.append("doc_type", docType);
    formDataBackend.append("docFront", docFrontFile, "documento_frente.jpg");
    if (docBackFile) formDataBackend.append("docBack", docBackFile, "documento_reverso.jpg");
    formDataBackend.append("video", videoFile, "video.mp4");
    formDataBackend.append("resultado", JSON.stringify(kycRes.data));

    console.log("=== Enviando Backend ===");
    for (let pair of formDataBackend.entries()) {
      console.log(pair[0], pair[1]);
    }

    const backendRes = await axios.post("/face/verify", formDataBackend, {
      headers: { "X-CSRF-TOKEN": csrf },
    });

    console.log("=== Respuesta Backend ===", backendRes.data);
    const data = backendRes.data;

    setMessage(data.mensaje || " Verificación realizada.");
    setProblems(data.sugerencias || []);

    if (data.status === "success" || data.kyc_status === "active") {
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        window.location.href = next || "/";
      }, 1500);
    }
  } catch (err) {
    console.error("=== Error en la verificación ===", err);

    if (err.response?.status === 422) {
      console.log("=== 422 Response Data ===", err.response.data);
      setMessage("⚠️ Datos inválidos: revisa los archivos.");
      setProblems(err.response.data?.errors || []);
    } else if (err.response?.data?.mensaje) {
      setMessage(" error" + err.response.data.mensaje);
    } else {
      setMessage(" Error inesperado en la verificación KYC.");
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-center">
        Verificación de identidad
      </h2>

      
      <div>
        <label className="text-sm font-medium">
          {docType === "pasaporte" ? "Pasaporte" : "Documento (Anverso)"}
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setDocFrontFile(e.target.files[0])}
        />
      </div>

      {requiereReverso && (
        <div>
          <label className="text-sm font-medium">Documento (Reverso)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setDocBackFile(e.target.files[0])}
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Video selfie</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />
      </div>

      
      <div className="grid sm:grid-cols-2 gap-3">
        {frontURL && (
          <img
            src={frontURL}
            onLoad={() => setLoadedFront(true)}
            className="rounded border shadow"
          />
        )}
        {backURL && (
          <img
            src={backURL}
            onLoad={() => setLoadedBack(true)}
            className="rounded border shadow opacity-80"
          />
        )}
      </div>

      {videoURL && (
        <video
          src={videoURL}
          controls
          onLoadedData={() => setLoadedVideo(true)}
          className="rounded border shadow w-full"
        />
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Atrás
        </button>

        <button
          onClick={handleSubmit}
          disabled={
            loading ||
            !loadedFront ||
            (requiereReverso && !loadedBack) ||
            !loadedVideo
          }
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-6 py-2 rounded flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin h-4 w-4" />}
          Verificar
        </button>
      </div>

   

    {resultado.problemas && resultado.problemas.length > 0 && (
      <div>
        <strong>Problemas detectados:</strong>
        <ul className="list-disc ml-5 text-red-600">
          {resultado.problemas.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    )}

    
  
    </div>
  );
}
