import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // iconos bonitos
import PasswordRules from "@/Components/register_and_complete/register/PasswordRules";

/**
 * Paso 2: Seguridad → Contraseña y confirmación con reglas.
 */
export default function Step2Security({ data, setData, errors, passwordRules }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-4">
      {/* Contraseña */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          className="border rounded w-full px-2 py-1 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      {/* Confirmar contraseña */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
        <input
          type={showConfirm ? "text" : "password"}
          value={data.password_confirmation}
          onChange={(e) => setData("password_confirmation", e.target.value)}
          className={`border rounded w-full px-2 py-1 pr-10 ${
            passwordRules.match ? "border-green-500" : "border-gray-300"
          }`}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {data.password_confirmation.length > 0 && !passwordRules.match && (
          <p className="text-red-500 text-sm">Las contraseñas no coinciden</p>
        )}
      </div>

      <PasswordRules rules={passwordRules} />
    </div>
  );
}
