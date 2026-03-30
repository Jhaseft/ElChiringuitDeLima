import { useState } from "react";
import { useForm } from "@inertiajs/react";
import Stepper from "@/Components/register_and_complete/complete-profile/Stepper";
import Step1Personal from "@/Components/register_and_complete/complete-profile/Step1Personal";
import Step2Security from "@/Components/register_and_complete/complete-profile/Step2Security";
import Step3Terms from "@/Components/register_and_complete/complete-profile/Step3Terms";
import StatusMessage from "@/Components/ui/StatusMessage";

/**
 * Wizard para completar el perfil de un usuario ya registrado.
 */
export default function CompleteProfile({ user }) {
  const [step, setStep] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const { data, setData, post, processing, errors } = useForm({
    nationality: user?.nationality || "",
    phone: user?.phone || "",
    document_number: user?.document_number || "",
    password: "",
    password_confirmation: "",
    terms: false,
  });

  // Reglas de contraseña
  const passwordRules = {
    digits: /^\d{4}$/.test(data.password),
    match: data.password === data.password_confirmation && data.password.length > 0,
  };

  const isNextDisabled = () => {
    if (step === 1) return !data.nationality || !data.phone || !data.document_number;
    if (step === 2) return !passwordRules.digits || !passwordRules.match;
    if (step === 3) return !data.terms;
    return false;
  };

  const nextStep = () => !isNextDisabled() && setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const submit = (e) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
    } else {
      post(route("complete-profile.store"), {
        onStart:   () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          setMessageType("success");
          setMessage("¡Perfil completado con éxito!");
        },
        onError: (errs) => {
          setLoading(false);
          setMessageType("error");
          setMessage(Object.values(errs)[0] || "Hubo un error al guardar el perfil.");
        },
        onFinish: () => setLoading(false),
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-10">
      <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-xl border-2 border-yellow-400 p-8 sm:p-12">
        <div className="flex flex-col items-center mb-6">
          <a href="/" className="hover:opacity-80 transition-opacity">
            <img
              src="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png"
              alt="Logo"
              className="w-16 h-16 object-contain mb-3"
            />
          </a>
          <h1 className="text-2xl font-extrabold text-white text-center">Completa tu perfil</h1>
          <p className="text-sm text-gray-400 text-center mt-1">
            Necesitamos algunos datos adicionales para activar tu cuenta.
          </p>
        </div>

        {loading && (
          <StatusMessage
            type="loading"
            title="Guardando tu perfil..."
          />
        )}

        {message && (
          <StatusMessage
            type={messageType}
            title={message}
            onClose={() => setMessage("")}
            actionLabel={messageType === "success" ? "Entendido" : "Cerrar"}
          />
        )}

        <Stepper step={step} />
        <form onSubmit={submit} className="space-y-5">
          {step === 1 && (
            <Step1Personal data={data} setData={setData} errors={errors} />
          )}
          {step === 2 && (
            <Step2Security
              data={data}
              setData={setData}
              errors={errors}
              passwordRules={passwordRules}
            />
          )}
          {step === 3 && (
            <Step3Terms data={data} setData={setData} errors={errors} />
          )}

          <div className="flex justify-between mt-6 gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 rounded-xl border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 transition font-semibold"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={processing || isNextDisabled()}
              className="flex-1 px-6 py-2.5 bg-yellow-400 text-gray-900 rounded-xl shadow-md hover:bg-yellow-500 transition disabled:opacity-50 font-semibold"
            >
              {step < 3 ? "Siguiente" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
