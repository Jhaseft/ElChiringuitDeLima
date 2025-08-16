export default function CambioDivisasCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-center mb-4">
        RAGNAR CAPITAL CASA DE CAMBIO
      </h2>
      <p className="text-center text-sm text-gray-500 mb-4">
        CAMBIA DE FORMA RÁPIDA Y SEGURA
      </p>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="TIENES BOLIVIANOS"
          className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
        />
        <input
          type="text"
          placeholder="RECIBES SOLES"
          className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
        />
        <button className="bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition">
          INICIAR UNA OPERACIÓN
        </button>
        <button className="bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition">
          CAMBIAR CON UN ASESOR
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Nuestro horario de atención es:</p>
        <ul className="mt-2 list-disc list-inside">
          <li>Perú: Lun-Vie 9:00-18:00, Sáb 9:00-13:00</li>
          <li>Bolivia: Lun-Vie 8:00-17:00, Sáb 9:00-13:00</li>
        </ul>
        <p className="mt-2 text-yellow-700 bg-yellow-100 p-2 rounded text-xs">
          Las operaciones fuera de horario serán procesadas el siguiente día hábil.
        </p>
      </div>
    </div>
  );
}
