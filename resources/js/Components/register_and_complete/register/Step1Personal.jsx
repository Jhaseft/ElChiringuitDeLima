export default function Step1Personal({ data, setData, errors }) {
  // Validador de nombre/apellido (solo frontend opcional)
  const validateName = (value) => {
    if (!value.trim()) return "Campo requerido";
    if (value.length < 2) return "Mínimo 2 caracteres";
    return null;
  };

  // Validador de email (solo frontend opcional)
  const validateEmail = (value) => {
    if (!value.trim()) return "Campo requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Correo inválido";
    return null;
  };

  const handleChange = (field, value) => {
    if (field === "first_name" || field === "last_name") {
      value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); // solo letras y espacios
    }
    setData(field, value);
  };

  return (
    <div className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="first_name"
          type="text"
          value={data.first_name}
          onChange={(e) => handleChange("first_name", e.target.value)}
          required
          className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm focus:ring ${
            errors.first_name
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
        />
        {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
      </div>

      {/* Apellido */}
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Apellido
        </label>
        <input
          id="last_name"
          type="text"
          value={data.last_name}
          onChange={(e) => handleChange("last_name", e.target.value)}
          required
          className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm focus:ring ${
            errors.last_name
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
        />
        {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm focus:ring ${
            errors.email
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
    </div>
  );
}
