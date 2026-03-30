/**
 * Stepper visual que indica en qué paso del registro está el usuario.
 */
export default function Stepper({ step }) {
  return (
    <div className="flex justify-between mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex-1">
          <div
            className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white font-bold 
              ${step === s ? "bg-yellow-400 text-gray-900" : step > s ? "bg-yellow-500 text-gray-900" : "bg-gray-600"}`}
          >
            {s}
          </div>
          <p className="text-center text-sm mt-2 text-gray-300">
            {s === 1 ? "Personales" : s === 2 ? "Extras" : "Seguridad"}
          </p>
        </div>
      ))}
    </div>
  );
}
