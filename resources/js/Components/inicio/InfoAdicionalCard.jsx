import NumeroAutorizadoButton from './NumeroAutorizadoButton';

export default function InfoAdicionalCard() {
  const numeros = [
    "51941262500",
    "59162400052",
    "51972555751",
    "59175665498",
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col gap-6">
      <div className="text-center">
        <p>¿Necesitas pagar a tus proveedores del extranjero? Hazlo fácilmente.</p>
        <button className="bg-green-700 text-white py-2 px-4 rounded font-semibold mt-2 hover:bg-green-800 transition">
          Envía dinero al extranjero
        </button>
      </div>

      <div>
        <h3 className="font-semibold mb-2">¿Por qué elegirnos?</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Transferencias seguras</li>
          <li>Atención personalizada</li>
          <li>Tasas competitivas</li>
        </ul>
      </div>

      <div className="border-t pt-4">
        <p className="text-red-600 font-semibold">¡Atención!</p>
        <p className="text-gray-700 text-sm mb-2">
          Personas inescrupulosas están usando números falsos. Solo comunícate con los oficiales autorizados.
        </p>
        <h4 className="font-semibold mb-2">Números Autorizados</h4>
        <div className="grid grid-cols-2 gap-2">
          {numeros.map((num) => (
            <NumeroAutorizadoButton key={num} numero={num} />
          ))}
        </div>
      </div>
    </div>
  );
}
