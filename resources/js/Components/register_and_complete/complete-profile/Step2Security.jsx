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
        <label className="block text-sm font-medium text-gray-300">Contraseña</label>
        <input
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          className="border border-gray-600 rounded w-full px-2 py-1 pr-10 bg-gray-700 text-white focus:border-yellow-400 focus:ring focus:ring-yellow-400/20"
          required
          inputMode="numeric"
          maxLength={4}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-8 text-gray-400 hover:text-gray-300"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
      </div>

      {/* Confirmar contraseña */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300">Confirmar contraseña</label>
        <input
          type={showConfirm ? "text" : "password"}
          value={data.password_confirmation}
          onChange={(e) => setData("password_confirmation", e.target.value)}
          className={`border rounded w-full px-2 py-1 pr-10 bg-gray-700 text-white ${
            passwordRules.match ? "border-green-500" : "border-gray-600 focus:border-yellow-400 focus:ring focus:ring-yellow-400/20"
          }`}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-2 top-8 text-gray-400 hover:text-gray-300"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {data.password_confirmation.length > 0 && !passwordRules.match && (
          <p className="text-red-400 text-sm">Las contraseñas no coinciden</p>
        )}
      </div>

      <PasswordRules rules={passwordRules} />
    </div>
  );
}
