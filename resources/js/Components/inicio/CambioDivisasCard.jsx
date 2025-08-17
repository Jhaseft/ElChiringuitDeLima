import { usePage, Link } from "@inertiajs/react";

export default function CambioDivisasCard() {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 flex flex-col gap-4 border border-gray-100">
      {/* Título */}
      <h2 className="text-xl font-extrabold text-center mb-2 bg-gradient-to-r from-green-700 to-green-500 text-transparent bg-clip-text">
        RAGNAR CAPITAL CASA DE CAMBIO
      </h2>
      <p className="text-center text-sm text-gray-600 mb-4 tracking-wide">
        CAMBIA DE FORMA RÁPIDA Y SEGURA
      </p>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="TIENES BOLIVIANOS"
          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
        />
        <input
          type="text"
          placeholder="RECIBES SOLES"
          className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
        />

        {/* Botones principales */}
        <button className="bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-800 transition-all shadow-md">
          INICIAR UNA OPERACIÓN
        </button>
        <button className="bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md">
          CAMBIAR CON UN ASESOR
        </button>

        {/* 🔹 Botones de login/registro solo si el usuario no está autenticado */}
        {!user && (
          <div className="flex gap-3 justify-center mt-2">
            <Link
              href="/login"
              className="flex-1 text-center py-2 rounded-lg font-semibold border border-green-500 text-green-600 hover:bg-green-50 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium">Nuestro horario de atención es:</p>
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>🇵🇪 Perú: Lun-Vie 9:00-18:00, Sáb 9:00-13:00</li>
          <li>🇧🇴 Bolivia: Lun-Vie 8:00-17:00, Sáb 9:00-13:00</li>
        </ul>
        <p className="mt-3 text-yellow-700 bg-yellow-100 p-2 rounded-md text-xs text-center shadow-sm">
          ⚠️ Las operaciones fuera de horario serán procesadas el siguiente día hábil.
        </p>
      </div>
    </div>
  );
}
