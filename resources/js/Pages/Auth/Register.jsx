import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import BotonGoogle from "@/Components/auth/Botongoogle";
import Stepper from "@/Components/auth/register/Stepper";
import Step1Personal from "@/Components/auth/register/Step1Personal";
import Step2Extras from "@/Components/auth/register/Step2Extras";
import Step3Security from "@/Components/auth/register/Step3Security";

/**
 * Componente principal del registro multistep.
 * Administra el estado del formulario y la navegación entre pasos.
 */
export default function Register() {
  const [step, setStep] = useState(1);

  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    nationality: "",
    document_number: "",
    password: "",
    password_confirmation: "",
    accepted_terms: false,
  });

  // Reglas de validación de contraseña
  const passwordRules = {
    length: data.password.length >= 8,
    upper: /[A-Z]/.test(data.password),
    lower: /[a-z]/.test(data.password),
    number: /[0-9]/.test(data.password),
    special: /[!@#$%^&*]/.test(data.password),
    match: data.password === data.password_confirmation && data.password.length > 0,
  };

  /** Validación para deshabilitar botón "Siguiente" */
  const isNextDisabled = () => {
    if (step === 1) return !data.first_name || !data.last_name || !data.email;
    if (step === 2) return !data.phone || !data.nationality || !data.document_number;
    if (step === 3) return !passwordRules.match || !data.accepted_terms;
    return false;
  };

  /** Avanza al siguiente paso */
  const nextStep = () => {
    if (!isNextDisabled()) setStep(step + 1);
  };

  /** Retrocede al paso anterior */
  const prevStep = () => setStep(step - 1);

  /** Envío final del formulario */
  const submit = (e) => {
    e.preventDefault();
    if (step < 3) {
      nextStep();
    } else {
      post(route("register"), {
        onFinish: () => reset("password", "password_confirmation"),
        onError: () => console.log(errors),
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 sm:px-6">
      <Head title="Crear cuenta" />

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          Crear una cuenta
        </h1>

        {/* Stepper */}
        <Stepper step={step} />

        {/* Formulario multistep */}
        <form onSubmit={submit} className="space-y-6">
          {step === 1 && (
            <Step1Personal data={data} setData={setData} errors={errors} />
          )}
          {step === 2 && (
            <Step2Extras data={data} setData={setData} errors={errors} />
          )}
          {step === 3 && (
            <Step3Security
              data={data}
              setData={setData}
              errors={errors}
              passwordRules={passwordRules}
            />
          )}

          {/* Botones */}
          <div className="flex justify-between mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-xl border border-gray-300"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={processing || isNextDisabled()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {step < 3 ? "Siguiente" : "Registrarse"}
            </button>
          </div>
        </form>

        {/* Botón Google */}
        <div className="mt-6 text-center">
          <BotonGoogle />
        </div>
      </div>
    </div>
  );
}
