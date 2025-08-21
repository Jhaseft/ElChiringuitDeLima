//barra de progreso
export default function StepProgress({ step, totalSteps }) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
              i < step ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-400"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center mt-2 font-medium text-gray-700">{`Paso ${step} de ${totalSteps}`}</p>
    </div>
  );
}
