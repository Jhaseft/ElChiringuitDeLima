/**
 * Paso 3: Aceptación de términos y condiciones.
 */
export default function Step3Terms({ data, setData, errors }) {
  return (
    <div>
      <label className="flex items-center text-gray-300">
        <input
          type="checkbox"
          checked={data.terms}
          onChange={(e) => setData("terms", e.target.checked)}
          className="mr-2 accent-yellow-400"
          required
        />
        Acepto los{" "}
        <a href="/politicas" className="text-yellow-400 hover:text-yellow-300 underline">términos y condiciones</a>
      </label>
      {errors.terms && <p className="text-red-400 text-sm">{errors.terms}</p>}
    </div>
  );
}
