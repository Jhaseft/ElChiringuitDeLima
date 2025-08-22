/**
 * Paso 1: Datos personales (nombre, apellido, email).
 */
export default function Step1Personal({ data, setData, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          id="first_name"
          type="text"
          value={data.first_name}
          onChange={(e) => setData("first_name", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Apellido
        </label>
        <input
          id="last_name"
          type="text"
          value={data.last_name}
          onChange={(e) => setData("last_name", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData("email", e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
    </div>
  );
}
