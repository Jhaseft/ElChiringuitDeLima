/**
 * Paso 2: Datos adicionales (teléfono, nacionalidad, documento).
 */
export default function Step2Extras({ data, setData, errors }) {
  return (
    <div className="space-y-5">
      {/* Teléfono */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          id="phone"
          type="text"
          value={data.phone}
          onChange={(e) => setData("phone", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      {/* Nacionalidad */}
      <div>
        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
          Nacionalidad
        </label>
        <select
          id="nationality"
          value={data.nationality}
          onChange={(e) => setData("nationality", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        >
          <option value="">Seleccione...</option>
          <option value="boliviano">Boliviano</option>
          <option value="peruano">Peruano</option>
        </select>
        {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
      </div>

      {/* Documento */}
      <div>
        <label htmlFor="document_number" className="block text-sm font-medium text-gray-700">
          Documento
        </label>
        <input
          id="document_number"
          type="text"
          value={data.document_number}
          onChange={(e) => setData("document_number", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        {errors.document_number && <p className="text-red-500 text-sm">{errors.document_number}</p>}
      </div>
    </div>
  );
}
