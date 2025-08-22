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
              ${step === s ? "bg-indigo-600" : step > s ? "bg-green-500" : "bg-gray-300"}`}
          >
            {s}
          </div>
          <p className="text-center text-sm mt-2">
            {s === 1 ? "Personales" : s === 2 ? "Extras" : "Seguridad"}
          </p>
        </div>
      ))}
    </div>
  );
}
