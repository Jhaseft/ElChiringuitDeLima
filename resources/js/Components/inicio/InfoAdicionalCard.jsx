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
    <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 border border-gray-100 transition hover:shadow-2xl hover:scale-[1.01] duration-300">
      
      <div className="text-center ">
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          ¿Necesitas pagar a tus proveedores del extranjero?
          <span className="text-green-700 font-semibold"> Hazlo fácilmente.</span>
        </p>

      </div>
      <a href="https://wa.me/59177958109?text=Hola,%20necesito%20información" className="bg-gradient-to-r from-green-700 to-green-500 text-white py-3 rounded-lg text-sm font-semibold text-center hover:scale-105 transition shadow-md">
        🌍 Envía dinero al extranjero
      </a>
      
      <div>
        <h3 className="font-semibold text-lg justify-center text-gray-800 mb-2 flex items-center gap-2">
           ¿Por qué elegirnos?
        </h3>
        <ul className="list-disc list-inside text-center text-gray-700 space-y-1 pl-2 text-sm">
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

    

    
      <div className="border-t pt-4">
        <p className="text-red-600 font-bold text-sm mb-1 text-center">Asesores Designados</p>

    
        <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
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

       
        <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
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
