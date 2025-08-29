import { useEffect } from "react";
import { IdCard, Car, Plane } from "lucide-react";

const DOCS = [
  { id: "ci", label: "Carnet de identidad", icon: IdCard, help: "Foto de anverso y reverso" },
  { id: "licencia", label: "Licencia de conducir", icon: Car, help: "Foto de anverso y reverso" },
  { id: "pasaporte", label: "Pasaporte", icon: Plane, help: "Una sola foto" },
];

export default function DocumentTypePicker({ value, onChange, onNext }) {

  // 👇 Se ejecuta al montar el componente
  useEffect(() => {
    // Detener cámara y micrófono si están en uso
    navigator.mediaDevices?.getUserMedia({ audio: true, video: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => {
        console.log("No había cámara/micrófono activos o no se pudieron detener:", err);
      });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="font-semibold text-lg text-center">Selecciona el tipo de documento</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {DOCS.map((d) => {
          const Icon = d.icon;
          const active = value === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange(d.id)}
              className={`rounded-2xl border px-4 py-4 text-left shadow-sm hover:shadow transition ${active
                ? "border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50"
                : "border-gray-200 bg-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-2 rounded-full ${active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-semibold text-sm sm:text-base">{d.label}</p>
                  <p className="text-xs text-gray-500">{d.help}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
