/**
 * Subcomponente que muestra las reglas de validación de la contraseña
 * cambiando de color según si se cumplen o no.
 */
export default function PasswordRules({ rules }) {
  return (
    <div className="text-sm space-y-1 mt-2">
      <p className={rules.length ? "text-yellow-400" : "text-gray-500"}>• Mínimo 8 caracteres</p>
      <p className={rules.upper ? "text-yellow-400" : "text-gray-500"}>• Una letra mayúscula</p>
      <p className={rules.lower ? "text-yellow-400" : "text-gray-500"}>• Una letra minúscula</p>
      <p className={rules.number ? "text-yellow-400" : "text-gray-500"}>• Al menos un número</p>
      <p className={rules.special ? "text-yellow-400" : "text-gray-500"}>• Al menos un carácter especial (!@#$%)</p>
    </div>
  );
}
