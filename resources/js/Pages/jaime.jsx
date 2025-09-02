// Jaime.jsx
import { useState } from "react";
import FingerprintForm from "./FingerprintCapture";

export default function Jaime() {
  const [resultado, setResultado] = useState(null);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
        Comparar Huellas
      </h1>

      <FingerprintForm setResultado={setResultado} />

      {resultado && (
        <div className="mt-6 p-4 bg-gray-100 rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Resultado de la API:
          </h2>
          <pre className="text-sm text-gray-800 bg-white p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(resultado, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
