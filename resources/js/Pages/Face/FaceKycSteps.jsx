import { useState } from "react";
import StepProgress from "@/Components/face/StepProgress";
import DocumentTypePicker from "@/Components/face/DocumentTypePicker";
import DocumentCapture from "@/Components/face/StepCarnet";
import StepVideo from "@/Components/face/StepVideo";
import StepReview from "@/Components/face/StepReview";

export default function FaceKycSteps() {  
  const [step, setStep] = useState(1); 

  // Tipo de documento
  const [docType, setDocType] = useState("ci"); // "ci" | "licencia" | "pasaporte"

  // Capturas del documento (anverso / reverso)
  const [docFrontBlob, setDocFrontBlob] = useState(null);
  const [docBackBlob, setDocBackBlob] = useState(null); // null si pasaporte

  // Video selfie
  const [videoBlob, setVideoBlob] = useState(null);

  // Resultado de backend  
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const totalSteps = 4; // 1) tipo, 2) doc, 3) video, 4) revisión
  
  //avanza es pasos pero maximo hasta 4
  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  //volver en pasos
  const prevStep = () => {
    setStep((s) => {
      if (s === 2) {
        // Limpia capturas al volver a escoger documento
        setDocFrontBlob(null);
        setDocBackBlob(null);
      }
      return Math.max(s - 1, 1);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-6">
      <div className="w-full max-w-3xl">
        <StepProgress
          step={step}
          totalSteps={totalSteps}
          labels={["Documento", "Captura", "Video", "Revisión"]}
        />

        {step === 1 && (
          <DocumentTypePicker
            value={docType}
            onChange={setDocType}
            onNext={nextStep}
          />
        )}

        {step === 2 && (
          <DocumentCapture
            docType={docType}
            docFrontBlob={docFrontBlob}
            docBackBlob={docBackBlob}
            setDocFrontBlob={setDocFrontBlob}
            setDocBackBlob={setDocBackBlob}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <StepVideo
            videoBlob={videoBlob}
            setVideoBlob={setVideoBlob}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {step === 4 && (
          <StepReview
            docType={docType}
            docFrontBlob={docFrontBlob}
            docBackBlob={docBackBlob}
            videoBlob={videoBlob}
            prevStep={prevStep}
            loading={loading}
            setLoading={setLoading}
            resultado={resultado}
            setResultado={setResultado}
          />
        )}
      </div>
    </div>
  );
}
