import { Upload, CheckCircle, Info, Check } from "lucide-react";

export default function FileUploadCard({
  label,
  description,
  accept,
  file,
  onChange,
  recommendations = [],
}) {
  return (
    <div className="space-y-3">
    <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>

      
      <label className="cursor-pointer block">
        <div
          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all
            ${
              file
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50"
            }
          `}
        >
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => onChange(e.target.files[0])}
          />

          {!file ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Upload className="w-7 h-7 text-indigo-500" />
              <p className="text-sm font-medium">{description}</p>
              <p className="text-xs text-gray-400">
                Haz clic para seleccionar un archivo
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-green-700">
              <CheckCircle className="w-7 h-7" />
              <p className="text-sm font-semibold">
                Archivo cargado correctamente
              </p>
              <p className="text-xs truncate max-w-[220px]">
                {file.name}
              </p>
            </div>
          )}
        </div>
      </label>

  
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold">
            <Info size={16} />
            Recomendaciones
          </div>

          <ul className="space-y-1.5">
            {recommendations.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-blue-800"
              >
                <Check
                  size={14}
                  className="mt-0.5 text-blue-600 shrink-0"
                />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
