import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import FileUploadCard from "@/Components/face/FileUploadCard";
import { useEffect, useState } from "react";

export default function DocumentCapture({
  docType, // "ci" | "licencia" | "pasaporte"
  docFrontBlob,
  docBackBlob,
  setDocFrontBlob,
  setDocBackBlob,
  onNext,
  onBack,
}) {
  const [errorFront, setErrorFront] = useState("");
  const [errorBack, setErrorBack] = useState("");

  const needsBack = docType === "ci" || docType === "licencia";

  const recommendations = [
    "Documento completo y visible",
    "Buena iluminación, sin reflejos",
    "Imagen nítida y legible",
    "Sin cortes ni bordes fuera de cuadro",
    "Formato soportado JPG o PNG",
  ];

  // Validación de archivos
  const handleFrontChange = (file) => {
    if (!file) {
      setDocFrontBlob(null);
      setErrorFront("");
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErrorFront(" Solo se permiten imágenes PNG o JPG");
      setDocFrontBlob(null);
      return;
    }

    setErrorFront("");
    setDocFrontBlob(file);
  };

  const handleBackChange = (file) => {
    if (!file) {
      setDocBackBlob(null);
      setErrorBack("");
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErrorBack(" Solo se permiten imágenes PNG o JPG");
      setDocBackBlob(null);
      return;
    }

    setErrorBack("");
    setDocBackBlob(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-6 max-w-lg mx-auto border border-gray-200">
      <div className="text-center">
        <span className="text-sm text-gray-500">Carga de documento</span>
        <p className="font-semibold text-xl text-gray-800 mt-1">
          {docType === "pasaporte" ? "Pasaporte" : "Documento de identidad"}
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
            {docType.toUpperCase()}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <FileUploadCard
          label={docType === "pasaporte" ? "Documento" : "Documento – Anverso"}
          description="Sube una imagen clara del documento"
          accept="image/png, image/jpeg"
          file={docFrontBlob}
          onChange={handleFrontChange}
          recommendations={recommendations}
        />
        {errorFront && <p className="text-red-500 text-sm">{errorFront}</p>}

        {needsBack && (
          <>
            <FileUploadCard
              label="Documento – Reverso"
              description="Sube la imagen del reverso"
              accept="image/png, image/jpeg"
              file={docBackBlob}
              onChange={handleBackChange}
              recommendations={recommendations}
            />
            {errorBack && <p className="text-red-500 text-sm">{errorBack}</p>}
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center justify-center gap-2 px-3 py-3 rounded-xl shadow"
        >
          <ArrowLeft size={18} /> Atrás
        </button>

        <button
          onClick={onNext}
          disabled={
            !docFrontBlob ||
            (needsBack && !docBackBlob) ||
            errorFront ||
            errorBack
          }
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl shadow ${
            !docFrontBlob ||
            (needsBack && !docBackBlob) ||
            errorFront ||
            errorBack
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Siguiente <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
