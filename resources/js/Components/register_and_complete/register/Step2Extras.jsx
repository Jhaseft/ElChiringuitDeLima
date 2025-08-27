import PhoneCountrySelect from "@/Components/register_and_complete/PhoneCountrySelect";

export default function Step2Extras({ data, setData, errors }) {
  // función para actualizar teléfono concatenado
  const updatePhone = (code, number) => {
    const phone = `${code || ""}${number || ""}`;
    setData("phone", phone); // 🔹 este es el que espera Laravel
  };

  return (
    <div className="space-y-5">
      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Número de teléfono
        </label>
        <div className="flex space-x-2">
          <PhoneCountrySelect
            value={data.phone_code || "+591"}
            onChange={(c) => {
              setData("phone_code", c);
              updatePhone(c, data.phone_number);
            }}
          />

          <input
            id="phone"
            type="tel"
            value={data.phone_number || ""}
            onChange={(e) => {
              const number = e.target.value.replace(/\D/g, ""); // solo dígitos
              setData("phone_number", number);
              updatePhone(data.phone_code, number);
            }}
            required
            placeholder="Ej: 76543210"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
              focus:border-indigo-500 focus:ring focus:ring-indigo-200"
          />
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone}</p>
        )}
      </div>

      {/* Nacionalidad */}
      <div>
        <label
          htmlFor="nationality"
          className="block text-sm font-medium text-gray-700"
        >
          Nacionalidad
        </label>
        <select
          id="nationality"
          value={data.nationality || ""}
          onChange={(e) => setData("nationality", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
            focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        >
          <option value="">Seleccione...</option>
          <option value="boliviano">Boliviano</option>
          <option value="peruano">Peruano</option>
        </select>
        {errors.nationality && (
          <p className="text-red-500 text-sm">{errors.nationality}</p>
        )}
      </div>

      {/* Documento */}
      <div>
        <label
          htmlFor="document_number"
          className="block text-sm font-medium text-gray-700"
        >
          Documento
        </label>
        <input
          id="document_number"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          value={data.document_number || ""}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "");
            setData("document_number", onlyDigits);
          }}
          required
          placeholder="Ej: 1234567"
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
            focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        {errors.document_number && (
          <p className="text-red-500 text-sm">{errors.document_number}</p>
        )}
      </div>
    </div>
  );
}
