import NumeroAutorizadoButton from "./NumeroAutorizadoButton";

export default function InfoAdicionalCard() {
  const asesoresBolivia = [
    { nombre: "Asesor 1", numero: "59177958109" },
    { nombre: "Asesor 2", numero: "59175995613" },
    { nombre: "Asesor 3", numero: "59176925774" },
    { nombre: "Asesor 4", numero: "59169325874" },
  ];

  const asesoresPeru = [
    { nombre: "Asesor 1", numero: "51907844210" },
  ];

  return (
    <div className="bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-3 border border-yellow-400 transition hover:shadow-2xl hover:scale-[1.01] duration-300">
      {/* Intro */}
      <div className="text-center ">
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          ¿Necesitas pagar a tus proveedores del extranjero?
          <span className="text-yellow-400 font-semibold"> Hazlo fácilmente.</span>
        </p>

      </div>
      <a href="https://wa.me/59177958109?text=Hola,%20necesito%20información" className="bg-yellow-400 text-gray-900 py-3 rounded-lg text-sm font-semibold text-center hover:bg-yellow-500 transition shadow-md">
        🌍 Envía dinero al extranjero
      </a>
      
      <div>
        <h3 className="font-semibold text-lg justify-center text-yellow-400 mb-2 flex items-center gap-2">
           ¿Por qué elegirnos?
        </h3>
        <ul className="list-disc list-inside text-center text-gray-300 space-y-1 pl-2 text-sm">
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
      <div className="border-t border-yellow-400 pt-4">
        <p className="text-yellow-400 font-bold text-sm mb-1 text-center">Asesores Designados</p>

        {/* Bolivia */}
        <h4 className="font-semibold text-gray-300 mb-2 text-sm flex items-center gap-2">
          🇧🇴 Bolivia
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {asesoresBolivia.map((asesor) => (
            <NumeroAutorizadoButton
              key={asesor.numero}
              nombre={asesor.nombre}
              numero={asesor.numero}
            />
          ))}
        </div>

        {/* Perú */}
        <h4 className="font-semibold text-gray-300 mb-2 text-sm flex items-center gap-2">
          🇵🇪 Perú
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {asesoresPeru.map((asesor) => (
            <NumeroAutorizadoButton
              key={asesor.numero}
              nombre={asesor.nombre}
              numero={asesor.numero}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
