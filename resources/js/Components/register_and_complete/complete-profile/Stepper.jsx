/**
 * Stepper visual que indica en qué paso del proceso está el usuario.
 */
export default function Stepper({ step }) {
  return (
    <div className="flex justify-between mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex-1">
          <div
            className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white font-bold ${
              step === s ? "bg-blue-600" : step > s ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {s}
          </div>
          <p className="text-center text-xs mt-1">
            {s === 1 ? "Personales" : s === 2 ? "Seguridad" : "Términos"}
          </p>
        </div>
      ))}
    </div>
  );
}
