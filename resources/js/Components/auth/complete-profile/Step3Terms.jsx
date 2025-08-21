/**
 * Paso 3: Aceptación de términos y condiciones.
 */
export default function Step3Terms({ data, setData, errors }) {
  return (
    <div>
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={data.terms}
          onChange={(e) => setData("terms", e.target.checked)}
          className="mr-2"
          required
        />
        Acepto los{" "}
        <a href="/terminos" className="text-blue-600 underline">términos y condiciones</a>
      </label>
      {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
    </div>
  );
}
