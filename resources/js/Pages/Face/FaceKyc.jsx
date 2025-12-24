import { useState } from "react";
import StepProgress from "@/Components/face/StepProgress";
import DocumentTypePicker from "@/Components/face/DocumentTypePicker";
import DocumentUpload from "@/Components/face/DocumentUpload";

export default function FaceKyc() {
  const [step, setStep] = useState(1);

  // Tipo de documento
  const [docType, setDocType] = useState("ci"); // ci | licencia | pasaporte

  // Archivos
  const [docFrontFile, setDocFrontFile] = useState(null);
  const [docBackFile, setDocBackFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // Backend
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const totalSteps = 2;

  const nextStep = () => setStep(2);

  const prevStep = () => {
    setDocFrontFile(null);
    setDocBackFile(null);
    setVideoFile(null);
    setStep(1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-3xl space-y-6">

        <StepProgress
          step={step}
          totalSteps={totalSteps}
          labels={["Documento", "Verificación"]}
        />

        {step === 1 && (
          <DocumentTypePicker
            value={docType}
            onChange={setDocType}
            onNext={nextStep}
          />
        )}

        {step === 2 && (
          <DocumentUpload
            docType={docType}
            docFrontFile={docFrontFile}
            docBackFile={docBackFile}
            videoFile={videoFile}
            setDocFrontFile={setDocFrontFile}
            setDocBackFile={setDocBackFile}
            setVideoFile={setVideoFile}
            loading={loading}
            setLoading={setLoading}
            resultado={resultado}
            setResultado={setResultado}
            onBack={prevStep}
          />
        )}

      </div>
    </div>
  );
}
