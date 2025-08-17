import NumeroAutorizadoButton from './NumeroAutorizadoButton';

export default function InfoAdicionalCard() {
  const numeros = [
    "51941262500",
    "59162400052",
    "51972555751",
    "59175665498",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col gap-6 border border-gray-100">
      {/* Sección principal */}
      <div className="text-center">
        <p className="text-gray-700 text-sm sm:text-base font-medium">
          ¿Necesitas pagar a tus proveedores del extranjero? 
          <span className="text-green-700 font-semibold"> Hazlo fácilmente.</span>
        </p>
        <button className="bg-gradient-to-r from-green-700 to-green-500 text-white py-2 px-5 rounded-lg font-semibold mt-3 hover:scale-105 transition-all shadow-md">
          🌍 Envía dinero al extranjero
        </button>
      </div>

      {/* Beneficios */}
      <div>
        <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
          ✅ ¿Por qué elegirnos?
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
          <li>Transferencias <span className="font-semibold">100% seguras</span></li>
          <li>Atención <span className="font-semibold">personalizada y rápida</span></li>
          <li>Tasas <span className="font-semibold">altamente competitivas</span></li>
        </ul>
      </div>

      {/* Alerta */}
      <div className="border-t pt-5">
        <p className="text-red-600 font-bold text-base flex items-center gap-1">
          ⚠️ ¡Atención!
        </p>
        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
          Personas inescrupulosas están usando números falsos. 
          <span className="font-semibold text-red-600"> Solo comunícate con los oficiales autorizados.</span>
        </p>

        {/* Números autorizados */}
        <h4 className="font-semibold text-gray-800 mb-3">📞 Números Autorizados</h4>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          {numeros.map((num) => (
            <NumeroAutorizadoButton key={num} numero={num} />
          ))}
        </div>
      </div>
    </div>
  );
}
