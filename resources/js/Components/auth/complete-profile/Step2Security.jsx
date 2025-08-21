import PasswordRules from "@/Components/auth/register/PasswordRules";

/**
 * Paso 2: Seguridad → Contraseña y confirmación con reglas.
 */
export default function Step2Security({ data, setData, errors, passwordRules }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          className="border rounded w-full px-2 py-1"
          required
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
        <input
          type="password"
          value={data.password_confirmation}
          onChange={(e) => setData("password_confirmation", e.target.value)}
          className={`border rounded w-full px-2 py-1 ${
            passwordRules.match ? "border-green-500" : "border-gray-300"
          }`}
          required
        />
        {data.password_confirmation.length > 0 && !passwordRules.match && (
          <p className="text-red-500 text-sm">Las contraseñas no coinciden</p>
        )}
      </div>

      <PasswordRules rules={passwordRules} />
    </div>
  );
}
