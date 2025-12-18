import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import BotonGoogle from "@/Components/auth/Botongoogle";
import Stepper from "@/Components/register_and_complete/register/Stepper";
import Step1Personal from "@/Components/register_and_complete/register/Step1Personal";
import Step2Extras from "@/Components/register_and_complete/register/Step2Extras";
import Step3Security from "@/Components/register_and_complete/register/Step3Security";
import axios from "axios";
import { router } from "@inertiajs/react"; 
/**
 * Componente principal del registro multistep.
 */
export default function Register() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState(""); // mensaje global de error
  const [loading, setLoading] = useState(false); // estado de pantalla de carga

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

  const passwordRules = {
    length: data.password.length >= 8,
    upper: /[A-Z]/.test(data.password),
    lower: /[a-z]/.test(data.password),
    number: /[0-9]/.test(data.password),
    special: /[!@#$%^&*]/.test(data.password),
    match: data.password === data.password_confirmation && data.password.length > 0,
  };

  const isNextDisabled = () => {
    if (step === 1) return !data.first_name || !data.last_name || !data.email;
    if (step === 2) return !data.phone || !data.nationality || !data.document_number;
    if (step === 3) return !passwordRules.match || !data.accepted_terms;
    return false;
  };

  const nextStep = () => {
    if (!isNextDisabled()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const submit = async (e) => {
  e.preventDefault();

  if (step < 3) {
    nextStep();
  } else {
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("/register-provisional", data);

      // Mostrar mensaje del backend
      setMessage(response.data.message || "Correo enviado correctamente.");

      reset("password", "password_confirmation");

      // Si todo salió bien, redirige después de 1 segundo
      if (response.data.status === "success") {
        setTimeout(() => {
          router.get("/"); // aquí pones la ruta principal
        }, 1000); // 1000 ms = 1 segundo
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Hubo un error al enviar el correo."
      );
    } finally {
      setLoading(false);
    }
  }
};


  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 sm:px-6">
      <Head title="Crear cuenta" />


      {loading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-xl p-6 flex flex-col items-center space-y-4 shadow-lg w-96 relative">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      <p className="text-gray-700 font-semibold">Enviando correo de verificación...</p>

      {message && (
        <div className={`mt-4 w-full p-3 rounded border flex justify-between items-center
          ${message.startsWith("✅") 
            ? "bg-green-100 border-green-400 text-green-700" 
            : "bg-red-100 border-red-400 text-red-700"}`}>
          <span>{message}</span>
          <button 
            onClick={() => setMessage("")} 
            className="text-xl font-bold leading-none focus:outline-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  </div>
)}

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
          Crear una cuenta
        </h1>

        {message && (
          <div
            className={`mb-4 p-3 rounded border ${message.startsWith("✅")
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
              }`}
          >
            {message}
          </div>
        )}


        <Stepper step={step} />


        <form onSubmit={submit} className="space-y-6">
          {step === 1 && <Step1Personal data={data} setData={setData} errors={errors} />}
          {step === 2 && <Step2Extras data={data} setData={setData} errors={errors} />}
          {step === 3 && <Step3Security data={data} setData={setData} errors={errors} passwordRules={passwordRules} />}


          <div className="flex justify-between mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-gray-300 disabled:opacity-50"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={processing || isNextDisabled() || loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {step < 3 ? "Siguiente" : "Registrarse"}
            </button>
          </div>
        </form>


        <div className="mt-6 text-center">
          <BotonGoogle />
        </div>
      </div>


      <style>{`
        .loader {
          border-top-color: #4f46e5;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
