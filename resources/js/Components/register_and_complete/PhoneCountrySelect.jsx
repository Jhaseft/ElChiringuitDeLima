import Select from "react-select";

// Lista de países con código y URL de la bandera
const countries = [
  { value: "+591", label: "+591", flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307093/bo_cvvq8f.png" },
  { value: "+51",  label: "+51",  flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307130/pe_wfge4z.png" },
  { value: "+54",  label: "+54",  flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307148/ar_gfxwtp.png" },
  { value: "+56",  label: "+56",  flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307165/cl_pevfj1.png" },
  { value: "+57",  label: "+57",  flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307169/co_wpavku.png" },
  { value: "+58",  label: "+58",  flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307176/ve_bnigse.png" },
  { value: "+55",  label: "+55",  flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307180/br_vm2zsn.png" },
  { value: "+53",  label: "+53",  flag: "https://res.cloudinary.com/dnbklbswg/image/upload/v1756307178/cu_bespzl.png" },
];

export default function PhoneCountrySelect({ value, onChange }) {
  const customOption = (props) => (
    <div
      {...props.innerProps}
      className={`flex items-center space-x-2 px-2 py-1 cursor-pointer ${
        props.isFocused ? "bg-gray-100" : ""
      }`}
    >
      <img
        src={props.data.flag}
        alt={props.data.label}
        className="w-6 h-4 sm:w-7 sm:h-5 rounded border object-cover"
      />
      <span className="text-xs sm:text-sm">{props.data.label}</span>
    </div>
  );

  const customSingleValue = ({ data }) => (
    <div className="flex items-center space-x-2">
      <img
        src={data.flag}
        alt={data.label}
        className="w-6 h-4 sm:w-7 sm:h-5 rounded border object-cover"
      />
      <span className="text-xs sm:text-sm">{data.label}</span>
    </div>
  );

  return (
    <Select
      options={countries}
      value={countries.find((c) => c.value === value)}
      onChange={(option) => onChange(option.value)}
      components={{
        Option: customOption,
        SingleValue: customSingleValue,
      }}
      isSearchable={false}
      styles={{
        control: (base) => ({
          ...base,
          minHeight: "34px",
          height: "34px",
          borderRadius: "6px",
          borderColor: "#d1d5db",
          display: "flex",
          alignItems: "center",
          boxShadow: "none",
          "&:hover": { borderColor: "#9ca3af" },
        }),
        valueContainer: (base) => ({
          ...base,
          display: "flex",
          alignItems: "center",
          padding: "0 6px",
        }),
        singleValue: (base) => ({
          ...base,
          display: "flex",
          alignItems: "center",
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: "2px",
        }),
        clearIndicator: (base) => ({
          ...base,
          padding: "2px",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "6px",
          marginTop: 2,
        }),
        option: (base) => ({
          ...base,
          padding: "4px 8px",
          fontSize: "13px",
        }),
      }}
      className="w-full sm:w-32 md:w-36"
    />
  );
}
