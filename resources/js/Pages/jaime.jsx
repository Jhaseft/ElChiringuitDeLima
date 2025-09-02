import { useState } from "react";
import FingerprintCapture from "./FingerprintCapture";

export default function Jaime() {
  // ✅ Aquí creamos el estado para la respuesta de la API
  const [resultado, setResultado] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Comparar Huellas</h1>

      {/* Componente hijo */}
      <FingerprintCapture
        onBack={() => console.log("Volver atrás")}
        onNext={() => console.log("Siguiente paso")}
        setResultado={setResultado} // ✅ Le pasamos la función al hijo
      />

      {/* Mostrar resultado */}
      {resultado && (
        <div className="mt-6 p-4 bg-gray-100 rounded-xl border">
          <h2 className="text-lg font-bold">Resultado de la API:</h2>
          <pre className="text-sm text-gray-800">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
