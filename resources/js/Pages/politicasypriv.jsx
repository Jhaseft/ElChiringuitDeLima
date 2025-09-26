import { Head } from "@inertiajs/react"; 
import InicioLayout from "@/Layouts/Inicio/InicioLayout";

export default function Politicas() {
  return (
    <>
      <Head title="Transfer Cash" />
      <InicioLayout>
        <div className="min-h-screen bg-gray-50 px-4 lg:px-52 py-10 flex justify-center">
          <div className="max-w-4xl w-full bg-white p-10 rounded-2xl shadow-lg">
            
            {/* Logo + título */}
            <div className="flex flex-col items-center text-center mb-10">
              <img 
                src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg" 
                alt="Transfer Cash Logo" 
                className="w-32 h-auto mb-4"
              />
              <h1 className="text-3xl font-extrabold text-gray-800">
                Términos y Condiciones de Uso
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Cuentas y Billeteras - Transfer Cash
              </p>
            </div>

            {/* Contenido dividido */}
            <div className="space-y-6 divide-y divide-gray-200">
              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Objeto</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  El presente documento regula el uso de cuentas bancarias, billeteras electrónicas y demás instrumentos financieros registrados y utilizados por los usuarios dentro de la plataforma web Transfer Cash (<a href="https://www.transfercash.click" className="text-indigo-600 underline">www.transfercash.click</a>).
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Declaración del usuario</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  El usuario declara bajo juramento que toda cuenta bancaria, billetera digital o medio de pago registrado en la plataforma es de su exclusiva titularidad, y que se encuentra habilitado legalmente para operar con dichos instrumentos. 
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Cesión de fondos</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Al realizar una operación en la plataforma, el usuario cede expresamente los fondos involucrados al beneficiario designado por él mismo, deslindando de responsabilidad a Transfer Cash por la ejecución de la transferencia conforme a las instrucciones proporcionadas.
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Usuarios</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Se considera “usuario” a toda persona natural que interactúe dentro de la plataforma web Transfer Cash, ya sea como cliente, remitente, destinatario u operador autorizado.
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Prohibiciones</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Los usuarios se comprometen a no registrar cuentas o billeteras de terceros sin autorización expresa, ni a utilizar la plataforma para fines ilícitos, fraudulentos, o en contravención de la normativa vigente.
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Responsabilidad del usuario</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Transfer Cash no será responsable por pérdidas, retrasos o controversias derivadas del uso incorrecto o fraudulento de los datos bancarios ingresados por el usuario.
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Confidencialidad y seguridad</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  El usuario se compromete a proteger su información personal y credenciales de acceso. Transfer Cash recomienda no compartir contraseñas ni información sensible con terceros.
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Modificaciones</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Transfer Cash se reserva el derecho de modificar, actualizar o complementar los presentes términos y condiciones en cualquier momento. 
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Jurisdicción</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Cualquier controversia será sometida a la jurisdicción de los tribunales de la ciudad de Lima, Perú.
                </p>
              </section>

              <section className="pt-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">Aceptación</h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  El uso de la plataforma <a href="https://www.transfercash.click" className="text-indigo-600 underline">www.transfercash.click</a> implica la aceptación total de los presentes términos y condiciones.
                </p>
              </section>
            </div>
          </div>
        </div>
      </InicioLayout>
    </>
  );
}
