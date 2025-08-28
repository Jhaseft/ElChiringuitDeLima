import { MessageCircle } from "lucide-react"; // ícono de WhatsApp
import NumeroAutorizadoButton from "./NumeroAutorizadoButton";

export default function InfoAdicionalCard() {
  const numerosBolivia = [
    "59177958109",
    "59175995613",
    "59176925774",
    "59169325874",
  ];
  const numerosPeru = ["51907844210"];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-6 border border-gray-100 transition hover:shadow-2xl hover:scale-[1.01] duration-300">
      {/* Intro */}
      <div className="text-center">
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          ¿Necesitas pagar a tus proveedores del extranjero?
          <span className="text-green-700 font-semibold"> Hazlo fácilmente.</span>
        </p>
        <button className="bg-gradient-to-r from-green-700 to-green-500 text-white py-2 px-5 rounded-lg text-sm font-semibold mt-4 hover:scale-105 transition shadow-md">
          🌍 Envía dinero al extranjero
        </button>
      </div>

      {/* Beneficios */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center gap-2">
          ✅ ¿Por qué elegirnos?
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2 text-sm">
          <li>
            Transferencias <span className="font-semibold">100% seguras</span>
          </li>
          <li>
            Atención <span className="font-semibold">personalizada y rápida</span>
          </li>
          <li>
            Tasas <span className="font-semibold">altamente competitivas</span>
          </li>
        </ul>
      </div>

      {/* Atención */}
      <div className="border-t pt-4">
        <p className="text-red-600 font-bold text-sm mb-1">⚠️ ¡Atención!</p>
        <p className="text-gray-700 text-xs sm:text-sm mb-3 leading-relaxed">
          Personas inescrupulosas están usando números falsos.
          <span className="font-semibold text-red-600">
            {" "}
            Solo comunícate con los oficiales autorizados.
          </span>
        </p>

        {/* Números Bolivia */}
        <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
          🇧🇴 Bolivia
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {numerosBolivia.map((num) => (
            <NumeroAutorizadoButton key={num} numero={num} />
          ))}
        </div>

        {/* Números Perú */}
        <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
          🇵🇪 Perú
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {numerosPeru.map((num) => (
            <NumeroAutorizadoButton key={num} numero={num} />
          ))}
        </div>
      </div>
    </div>
  );
}
