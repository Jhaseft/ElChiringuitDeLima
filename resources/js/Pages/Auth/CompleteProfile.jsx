import { useState } from "react";
import { useForm } from "@inertiajs/react";
import Stepper from "@/Components/auth/complete-profile/Stepper";
import Step1Personal from "@/Components/auth/complete-profile/Step1Personal";
import Step2Security from "@/Components/auth/complete-profile/Step2Security";
import Step3Terms from "@/Components/auth/complete-profile/Step3Terms";

/**
 * Wizard para completar el perfil de un usuario ya registrado.
 */
export default function CompleteProfile({ user }) {
  const [step, setStep] = useState(1);

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
    length: data.password.length >= 8,
    upper: /[A-Z]/.test(data.password),
    lower: /[a-z]/.test(data.password),
    number: /[0-9]/.test(data.password),
    special: /[!@#$%^&*]/.test(data.password),
    match: data.password === data.password_confirmation && data.password.length > 0,
  };

  const isNextDisabled = () => {
    if (step === 1) return !data.nationality || !data.phone || !data.document_number;
    if (step === 2)
      return !passwordRules.length || !passwordRules.upper || !passwordRules.lower ||
             !passwordRules.number || !passwordRules.special || !passwordRules.match;
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
        onError: () => console.log(errors),
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-6 text-center">Completa tu perfil</h1>

      <Stepper step={step} />

      <form onSubmit={submit} className="space-y-4">
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

        <div className="flex justify-between mt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 rounded border border-gray-300"
            >
              Atrás
            </button>
          )}
          <button
            type="submit"
            disabled={processing || isNextDisabled()}
            className="px-6 py-2 bg-blue-600 text-white rounded w-full sm:w-auto disabled:opacity-50"
          >
            {step < 3 ? "Siguiente" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
