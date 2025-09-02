// FingerprintForm.jsx
import { useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";

export default function FingerprintForm({ setResultado }) {
  const [finger1, setFinger1] = useState(null);
  const [finger2, setFinger2] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0] || null);
  };

  const sendToAPI = async () => {
    if (!finger1 || !finger2) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fingerprint1", finger1);
      formData.append("fingerprint2", finger2);

      const res = await axios.post(
        "https://apihuellas-production.up.railway.app/compare-fingerprints",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResultado(res.data);
    } catch (err) {
      console.error(err);
      setResultado({ error: "⚠️ Error al enviar huellas." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border space-y-6">
      {/* Primer archivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subir primera huella
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setFinger1)}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
            file:rounded-full file:border-0 file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {finger1 && (
          <p className="text-xs text-green-600 mt-1">✅ Archivo seleccionado</p>
        )}
      </div>

      {/* Segundo archivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subir segunda huella
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setFinger2)}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
            file:rounded-full file:border-0 file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {finger2 && (
          <p className="text-xs text-green-600 mt-1">✅ Archivo seleccionado</p>
        )}
      </div>

      {/* Botón de enviar */}
      <div>
        <button
          onClick={sendToAPI}
          disabled={!finger1 || !finger2 || loading}
          className={`w-full px-4 py-2 rounded-xl shadow flex items-center justify-center gap-2 
            ${
              !finger1 || !finger2 || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
        >
          {loading ? "Enviando..." : <> <Send size={18} /> Enviar </>}
        </button>
      </div>
    </div>
  );
}
