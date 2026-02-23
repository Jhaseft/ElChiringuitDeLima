import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import BotonGoogle from "@/Components/auth/Botongoogle";
import Stepper from "@/Components/register_and_complete/register/Stepper";
import Step1Personal from "@/Components/register_and_complete/register/Step1Personal";
import Step2Extras from "@/Components/register_and_complete/register/Step2Extras";
import Step3Security from "@/Components/register_and_complete/register/Step3Security";
import StatusMessage from "@/Components/ui/StatusMessage";
import axios from "axios";
import { router } from "@inertiajs/react";
/**
 * Componente principal del registro multistep.
 */
export default function Register() {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);

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

        setMessageType("success");
        setMessage(response.data.message || "Correo enviado correctamente.");

        reset("password", "password_confirmation");

        if (response.data.status === "success") {
          setTimeout(() => {
            router.get("/");
          }, 1000);
        }
      } catch (err) {
        setMessageType("error");
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
        <StatusMessage
          type="loading"
          title="Enviando correo de verificación..."
        />
      )}

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
          Crear una cuenta
        </h1>

        {message && (
          <StatusMessage
            type={messageType}
            title={message}
            onClose={() => setMessage("")}
            actionLabel={messageType === "success" ? "Entendido" : "Cerrar"}
          />
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


    </div>
  );
}
