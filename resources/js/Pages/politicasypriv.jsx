import { Head } from "@inertiajs/react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";

export default function Politicas() {
  return (
    <>
      <Head title="Transfer Cash" />
      <InicioLayout>
       <div className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
        <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Términos y Condiciones de Uso de Cuentas y Billeteras - Transfer Cash</h1>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Objeto</h2>
            <p className="text-gray-700 text-sm">
              El presente documento regula el uso de cuentas bancarias, billeteras electrónicas y demás instrumentos financieros registrados y utilizados por los usuarios dentro de la plataforma web Transfer Cash (<a href="https://www.elchangarrodelima.com" className="text-indigo-600 underline">www.elchangarrodelima.com</a>).
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Declaración del usuario</h2>
            <p className="text-gray-700 text-sm">
              El usuario declara bajo juramento que toda cuenta bancaria, billetera digital o medio de pago registrado en la plataforma es de su exclusiva titularidad, y que se encuentra habilitado legalmente para operar con dichos instrumentos. Cualquier error, falsedad o uso indebido, voluntario o involuntario, será de su única y exclusiva responsabilidad.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Cesión de fondos</h2>
            <p className="text-gray-700 text-sm">
              Al realizar una operación en la plataforma, el usuario cede expresamente los fondos involucrados al beneficiario designado por él mismo, deslindando de responsabilidad a Transfer Cash por la ejecución de la transferencia conforme a las instrucciones proporcionadas.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
            <p className="text-gray-700 text-sm">
              Se considera “usuario” a toda persona natural que interactúe dentro de la plataforma web Transfer Cash, ya sea como cliente, remitente, destinatario u operador autorizado, aceptando estos términos al registrarse o utilizar cualquiera de los servicios ofrecidos.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Prohibiciones</h2>
            <p className="text-gray-700 text-sm">
              Los usuarios se comprometen a no registrar cuentas o billeteras de terceros sin autorización expresa y documentada, ni a utilizar la plataforma para fines ilícitos, fraudulentos, o en contravención de la normativa vigente en Perú, Bolivia u otros países relacionados con la operación.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Responsabilidad del usuario</h2>
            <p className="text-gray-700 text-sm">
              Transfer Cash no será responsable por pérdidas, retrasos o controversias derivadas del uso incorrecto o fraudulento de los datos bancarios ingresados por el usuario. Es deber del usuario verificar cuidadosamente la información antes de confirmar cualquier operación.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Confidencialidad y seguridad</h2>
            <p className="text-gray-700 text-sm">
              El usuario se compromete a proteger su información personal y credenciales de acceso. Transfer Cash recomienda no compartir contraseñas ni información sensible con terceros, y se reserva el derecho de suspender cuentas ante sospechas fundadas de uso indebido.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Modificaciones</h2>
            <p className="text-gray-700 text-sm">
              Transfer Cash se reserva el derecho de modificar, actualizar o complementar los presentes términos y condiciones en cualquier momento. Las modificaciones serán comunicadas mediante la plataforma y entrarán en vigencia desde su publicación.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Jurisdicción</h2>
            <p className="text-gray-700 text-sm">
              Cualquier controversia derivada de la interpretación o aplicación de estos términos será sometida a la jurisdicción de los tribunales de la ciudad de Lima, Perú, con renuncia expresa a cualquier otro fuero.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Aceptación</h2>
            <p className="text-gray-700 text-sm">
              El uso de la plataforma <a href="https://www.elchangarrodelima.com" className="text-indigo-600 underline">www.elchangarrodelima.com</a> implica la aceptación total de los presentes términos y condiciones por parte del usuario.
            </p>
          </section>
        </div>
      </div>
      </InicioLayout>
    </>
  );
}
