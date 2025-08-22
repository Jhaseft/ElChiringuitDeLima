/**
 * Subcomponente que muestra las reglas de validación de la contraseña
 * cambiando de color según si se cumplen o no.
 */
export default function PasswordRules({ rules }) {
  return (
    <div className="text-sm text-gray-700 space-y-1 mt-2">
      <p className={rules.length ? "text-green-600" : "text-gray-400"}>• Mínimo 8 caracteres</p>
      <p className={rules.upper ? "text-green-600" : "text-gray-400"}>• Una letra mayúscula</p>
      <p className={rules.lower ? "text-green-600" : "text-gray-400"}>• Una letra minúscula</p>
      <p className={rules.number ? "text-green-600" : "text-gray-400"}>• Al menos un número</p>
      <p className={rules.special ? "text-green-600" : "text-gray-400"}>• Al menos un carácter especial (!@#$%)</p>
    </div>
  );
}
