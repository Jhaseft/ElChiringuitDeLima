import PasswordRules from "./PasswordRules";

/**
 * Paso 3: Seguridad (contraseña, confirmación y términos).
 */
export default function Step3Security({ data, setData, errors, passwordRules }) {
  return (
    <div className="space-y-5">
      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      {/* Confirmación de contraseña */}
      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
          Confirmar contraseña
        </label>
        <input
          id="password_confirmation"
          type="password"
          value={data.password_confirmation}
          onChange={(e) => setData("password_confirmation", e.target.value)}
          required
          className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm focus:ring 
            ${passwordRules.match
              ? "border-green-500 focus:border-green-500 focus:ring-green-200"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
            }`}
        />
        {data.password_confirmation.length > 0 && !passwordRules.match && (
          <p className="text-red-500 text-sm">Las contraseñas no coinciden</p>
        )}
      </div>

      {/* Reglas de contraseña */}
      <PasswordRules rules={passwordRules} />

      {/* Términos y condiciones */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="accepted_terms"
          checked={data.accepted_terms}
          onChange={(e) => setData("accepted_terms", e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          required
        />
        <label htmlFor="accepted_terms" className="ml-2 block text-sm text-gray-700">
          Acepto los{" "}
          <a href="/politicas" className="text-indigo-600 underline">
            términos y condiciones
          </a>
        </label>
        {errors.accepted_terms && <p className="text-red-500 text-sm">{errors.accepted_terms}</p>}
      </div>
    </div>
  );
}
