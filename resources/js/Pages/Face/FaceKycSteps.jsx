import { useRef, useState } from "react";
import StepProgress from "../../Components/face/StepProgress";
import StepCarnet from "../../Components/face/StepCarnet";
import StepVideo from "../../Components/face/StepVideo";
import StepReview from "../../Components/face/StepReview";

export default function FaceKycSteps() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  const [step, setStep] = useState(1);
  const [carnetBlob, setCarnetBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-6">
      <div className="w-full max-w-3xl">
        <StepProgress step={step} totalSteps={3} />

        {step === 1 && (
          <StepCarnet
            videoRef={videoRef}
            carnetBlob={carnetBlob}
            setCarnetBlob={setCarnetBlob}
            nextStep={nextStep}
          />
        )}

        {step === 2 && (
          <StepVideo
            videoRef={videoRef}
            mediaRecorderRef={mediaRecorderRef}
            recordedChunks={recordedChunks}
            videoBlob={videoBlob}
            setVideoBlob={setVideoBlob}
            recording={recording}
            setRecording={setRecording}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {step === 3 && (
          <StepReview
            carnetBlob={carnetBlob}
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
