export default function Pasos() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-white">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-6 drop-shadow-lg">
            Solicitud de Eliminación de Cuenta de Ludo Clásico
          </h1>

          <p className="text-justify leading-relaxed mb-4">
            <strong>Ludo Clásico</strong> guarda tu progreso de juego (estadísticas,
            monedas e inventario de skins) en nuestros servidores seguros de Firebase,
            vinculados a tu ID de Google Play Games.
          </p>

          <p className="text-justify leading-relaxed mb-4">
            Si deseas eliminar permanentemente tu cuenta y todos los datos asociados,
            por favor envía una solicitud por correo electrónico a:
          </p>

          <p className="text-center text-lg font-semibold text-yellow-300 mb-4">
            📧 email-de-soporte@gmail.com
          </p>

          <p className="text-justify leading-relaxed mb-6">
            Por favor, usa el asunto <strong>"Solicitud de Eliminación de Cuenta"</strong> 
            e incluye tu nombre de jugador (<em>Gamertag</em>) de Google Play si es posible.
            La eliminación de los datos se completará en un plazo de{" "}
            <strong>14 días</strong>.
          </p>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-200">
              © 2025 Huguier Lee. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
