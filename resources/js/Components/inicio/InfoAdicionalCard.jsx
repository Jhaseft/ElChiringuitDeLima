import NumeroAutorizadoButton from './NumeroAutorizadoButton';

export default function InfoAdicionalCard() {
  const numeros = [
    "51941262500",
    "59162400052",
    "51972555751",
    "59175665498",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex-1 flex flex-col gap-5 border border-gray-100 w-full">
      <div className="text-center">
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          ¿Necesitas pagar a tus proveedores del extranjero? 
          <span className="text-green-700 font-semibold"> Hazlo fácilmente.</span>
        </p>
        <button className="bg-gradient-to-r from-green-700 to-green-500 text-white py-2 px-4 rounded-lg text-sm font-semibold mt-3 hover:scale-105 transition-all shadow-md">
          🌍 Envía dinero al extranjero
        </button>
      </div>

      <div>
        <h3 className="font-semibold text-base text-gray-800 mb-2 flex items-center gap-2">
          ✅ ¿Por qué elegirnos?
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2 text-sm">
          <li>Transferencias <span className="font-semibold">100% seguras</span></li>
          <li>Atención <span className="font-semibold">personalizada y rápida</span></li>
          <li>Tasas <span className="font-semibold">altamente competitivas</span></li>
        </ul>
      </div>

      <div className="border-t pt-4">
        <p className="text-red-600 font-bold text-sm flex items-center gap-1 mb-1">
          ⚠️ ¡Atención!
        </p>
        <p className="text-gray-700 text-xs mb-3 leading-relaxed">
          Personas inescrupulosas están usando números falsos. 
          <span className="font-semibold text-red-600"> Solo comunícate con los oficiales autorizados.</span>
        </p>

        <h4 className="font-semibold text-gray-800 mb-2 text-sm">📞 Números Autorizados</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {numeros.map((num) => (
            <NumeroAutorizadoButton key={num} numero={num} />
          ))}
        </div>
      </div>
    </div>
  );
}
