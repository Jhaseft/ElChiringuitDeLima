/**
 * Paso 1: Datos personales extra (nacionalidad, teléfono, documento).
 */
export default function Step1Personal({ data, setData, errors }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
        <select
          value={data.nationality}
          onChange={(e) => setData("nationality", e.target.value)}
          className="border rounded w-full px-2 py-1"
          required
        >
          <option value="">Seleccione...</option>
          <option value="boliviano">Boliviano</option>
          <option value="peruano">Peruano</option>
        </select>
        {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          type="text"
          value={data.phone}
          onChange={(e) => setData("phone", e.target.value)}
          className="border rounded w-full px-2 py-1"
          required
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Documento</label>
        <input
          type="text"
          value={data.document_number}
          onChange={(e) => setData("document_number", e.target.value)}
          className="border rounded w-full px-2 py-1"
          required
        />
        {errors.document_number && <p className="text-red-500 text-sm">{errors.document_number}</p>}
      </div>
    </div>
  );
}
