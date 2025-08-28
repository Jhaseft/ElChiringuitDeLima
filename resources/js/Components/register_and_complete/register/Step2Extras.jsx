import Select from "react-select";

export default function Step2Extras({ data, setData, errors }) {
  // Lista de países con código y bandera, incluyendo opción inicial
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

  // Render opción con bandera
  const customOption = (props) => (
    <div
      {...props.innerProps}
      className={`flex items-center space-x-2 px-2 py-1 cursor-pointer ${props.isFocused ? "bg-gray-100" : ""}`}
    >
      {props.data.flag && <img src={props.data.flag} alt={props.data.label} className="w-6 h-4 sm:w-7 sm:h-5 rounded border object-cover" />}
      <span className="text-xs sm:text-sm">{props.data.label}</span>
    </div>
  );

  // Render valor seleccionado con bandera
  const customSingleValue = ({ data }) => (
    <div className="flex items-center space-x-2">
      {data.flag && <img src={data.flag} alt={data.label} className="w-6 h-4 sm:w-7 sm:h-5 rounded border object-cover" />}
      <span className="text-xs sm:text-sm">{data.label}</span>
    </div>
  );

  // Función para actualizar teléfono concatenado
  const updatePhone = (code, number) => {
    if (!code || !number) {
      setData("phone", "");
      return;
    }
    const cleanCode = code.replace(/\D/g, ""); // quitar '+'
    setData("phone", `${cleanCode}${number}`);
  };

  return (
    <div className="space-y-5">
      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Número de teléfono</label>
        <div className="flex space-x-2">
          <Select
            options={countries}
            value={countries.find((c) => c.value === (data.phone_code || ""))}
            onChange={(option) => {
              setData("phone_code", option.value);
              updatePhone(option.value, data.phone_number);
            }}
            components={{ Option: customOption, SingleValue: customSingleValue }}
            isSearchable={false}
            styles={{
              control: (base) => ({ ...base, minHeight: "34px", height: "34px", borderRadius: "6px", borderColor: "#d1d5db", display: "flex", alignItems: "center", boxShadow: "none", "&:hover": { borderColor: "#9ca3af" } }),
              valueContainer: (base) => ({ ...base, display: "flex", alignItems: "center", padding: "0 6px" }),
              singleValue: (base) => ({ ...base, display: "flex", alignItems: "center" }),
              dropdownIndicator: (base) => ({ ...base, padding: "2px" }),
              clearIndicator: (base) => ({ ...base, padding: "2px" }),
              menu: (base) => ({ ...base, borderRadius: "6px", marginTop: 2 }),
              option: (base) => ({ ...base, padding: "4px 8px", fontSize: "13px" }),
            }}
            className="w-full sm:w-32 md:w-36"
          />

          <input
            id="phone"
            type="tel"
            value={data.phone_number || ""}
            onChange={(e) => {
              const number = e.target.value.replace(/\D/g, "");
              setData("phone_number", number);
              updatePhone(data.phone_code, number);
            }}
            required
            placeholder="Ej: 76543210"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-1.5 text-sm shadow-sm
              focus:border-indigo-500 focus:ring focus:ring-indigo-200"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      {/* Nacionalidad */}
      <div>
        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nacionalidad</label>
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
        {errors.nationality && <p className="text-red-500 text-sm">{errors.nacionalidad}</p>}
      </div>

      {/* Documento */}
      <div>
        <label htmlFor="document_number" className="block text-sm font-medium text-gray-700">Documento</label>
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
        {errors.document_number && <p className="text-red-500 text-sm">{errors.document_number}</p>}
      </div>
    </div>
  );
}
