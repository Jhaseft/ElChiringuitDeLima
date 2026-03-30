import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import PasswordRules from "./PasswordRules";

/**
 * Paso 3: Seguridad (contraseña, confirmación y términos).
 */
export default function Step3Security({ data, setData, errors, passwordRules }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-5">
      
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Contraseña
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          required
          inputMode="numeric"
          maxLength={4}
          className="mt-1 w-full rounded-xl border border-gray-600 bg-gray-700 text-white px-4 py-2.5 pr-10 text-sm shadow-sm
          focus:border-yellow-400 focus:ring focus:ring-yellow-400/20"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
      </div>

     
      <div className="relative">
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300">
          Confirmar contraseña
        </label>
        <input
          id="password_confirmation"
          type={showConfirm ? "text" : "password"}
          value={data.password_confirmation}
          onChange={(e) => setData("password_confirmation", e.target.value)}
          required
          className={`mt-1 w-full rounded-xl border bg-gray-700 text-white px-4 py-2.5 pr-10 text-sm shadow-sm focus:ring 
            ${passwordRules.match
              ? "border-green-500 focus:border-green-500 focus:ring-green-200"
              : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"
            }`}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-9 text-gray-400 hover:text-gray-300"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {data.password_confirmation.length > 0 && !passwordRules.match && (
          <p className="text-red-400 text-sm">Las contraseñas no coinciden</p>
        )}
      </div>

  
      <PasswordRules rules={passwordRules} />

      
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="accepted_terms"
          checked={data.accepted_terms}
          onChange={(e) => setData("accepted_terms", e.target.checked)}
          className="h-4 w-4 text-yellow-400 border-gray-600 rounded bg-gray-700"
          required
        />
        <label htmlFor="accepted_terms" className="ml-2 block text-sm text-gray-300">
          Acepto los{" "}
          <a href="/politicas" className="text-yellow-400 underline hover:text-yellow-300">
            términos y condiciones
          </a>
        </label>
        {errors.accepted_terms && <p className="text-red-400 text-sm">{errors.accepted_terms}</p>}
      </div>
    </div>
  );
}
