/**
 * Subcomponente que muestra las reglas de validación de la contraseña
 * cambiando de color según si se cumplen o no.
 */
export default function PasswordRules({ rules }) {
  return (
    <div className="text-sm space-y-1 mt-2">
      <p className={rules.digits ? "text-yellow-400" : "text-gray-500"}>• Exactamente 4 dígitos numéricos</p>
    </div>
  );
}
