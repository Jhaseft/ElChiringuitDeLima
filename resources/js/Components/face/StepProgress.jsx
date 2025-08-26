export default function StepProgress({ step, totalSteps, labels = [] }) {
  const progress = Math.max(0, Math.min(100, (step / totalSteps) * 100));


  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${i + 1 <= step
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-gray-300 text-gray-400"
                }`}
            >
              {i + 1}
            </div>
            {labels[i] && (
              <span className="mt-1 text-[11px] sm:text-xs text-gray-600 font-medium">{labels[i]}</span>
            )}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden shadow-inner">
        <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center mt-2 font-medium text-gray-700">{`Paso ${step} de ${totalSteps}`}</p>
    </div>
  );
}