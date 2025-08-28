export default function Step1Personal({ data, setData, errors }) {
  const countries = [
    { value: "", label: "Seleccione...", flag: "" },
    { value: "+591", label: "+591", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307093/bo_cvvq8f.png" },
    { value: "+51", label: "+51", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307130/pe_wfge4z.png" },
    { value: "+54", label: "+54", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307148/ar_gfxwtp.png" },
    { value: "+56", label: "+56", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307165/cl_pevfj1.png" },
    { value: "+57", label: "+57", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307169/co_wpavku.png" },
    { value: "+58", label: "+58", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307176/ve_bnigse.png" },
    { value: "+55", label: "+55", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307180/br_vm2zsn.png" },
    { value: "+53", label: "+53", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307178/cu_bespzl.png" },
  ];

  const updatePhone = (code, number) => {
    if (!code || !number) {
      setData("phone", "");
      return;
    }
    const cleanCode = code.replace(/\D/g, ""); // quitar '+'
    setData("phone", `${cleanCode}${number}`);
  };

  return (
    <div className="space-y-4">
      {/* Nacionalidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
        <select
          value={data.nationality || ""}
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

      {/* Teléfono con código */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
        <div className="flex space-x-2">
          <select
            value={data.phone_code || ""}
            onChange={(e) => {
              setData("phone_code", e.target.value);
              updatePhone(e.target.value, data.phone_number);
            }}
            className="rounded border px-2 py-1"
          >
            {countries.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="tel"
            value={data.phone_number || ""}
            onChange={(e) => {
              const number = e.target.value.replace(/\D/g, "");
              setData("phone_number", number);
              updatePhone(data.phone_code, number);
            }}
            required
            placeholder="Ej: 76543210"
            className="flex-1 rounded border px-2 py-1"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      {/* Documento */}
      <div>
        <label className="block text-sm font-medium text-gray-700">DNI o CI</label>
        <input
          type="text"
          value={data.document_number || ""}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "");
            setData("document_number", onlyDigits);
          }}
          required
          placeholder="Ej: 1234567"
          className="border rounded w-full px-2 py-1"
        />
        {errors.document_number && <p className="text-red-500 text-sm">{errors.document_number}</p>}
      </div>
    </div>
  );
}
