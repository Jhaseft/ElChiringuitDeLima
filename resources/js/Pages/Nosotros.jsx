import { Head } from "@inertiajs/react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";

export default function Nosotros() {
  return (
    <>
      <Head title="Transfer Cash - Nosotros" />
      <InicioLayout>
        <div className="min-h-screen bg-gray-50 px-4 lg:px-52 py-1 ">
          {/* Banner */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-10">
            <img
              src="https://res.cloudinary.com/dnbklbswg/image/upload/v1756305635/logo_n6nqqr.jpg"
              alt="Transfer Cash"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Sobre Transfer Cash
              </h1>
            </div>
          </div>

          {/* Historia */}
          <section className="max-w-4xl mx-auto mb-10">
            <h2 className="text-2xl font-bold mb-4">Nuestra Historia</h2>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              Transfer Cash nació en 2022 con el objetivo de simplificar las
              transferencias de dinero entre Perú y Bolivia, ofreciendo un
              servicio seguro, rápido y confiable para todos nuestros usuarios.
              Desde nuestros inicios, nos enfocamos en la innovación tecnológica
              y la satisfacción del cliente.
            </p>
          </section>

          {/* Misión y Visión */}
          <section className="max-w-4xl mx-auto mb-10 grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Misión</h3>
              <p className="text-gray-700 text-sm md:text-base">
                Facilitar transferencias de dinero seguras y rápidas, conectando
                personas y negocios a través de soluciones financieras
                innovadoras, con total transparencia y confianza.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Visión</h3>
              <p className="text-gray-700 text-sm md:text-base">
                Ser la plataforma líder en Latinoamérica para transferencias
                electrónicas, reconocida por su seguridad, eficiencia y
                atención al cliente de excelencia.
              </p>
            </div>
          </section>

          {/* Equipo */}
          <section className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Nuestro Equipo</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Juan Perez"
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h4 className="font-semibold text-lg">Juan Roman</h4>
                <p className="text-gray-600 text-sm">CEO & Fundador</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Maria Lopez"
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h4 className="font-semibold text-lg">Maria Lopez</h4>
                <p className="text-gray-600 text-sm">Gerente de Operaciones</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <img
                  src="https://randomuser.me/api/portraits/men/56.jpg"
                  alt="Carlos Ruiz"
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h4 className="font-semibold text-lg">Carlos Ruiz</h4>
                <p className="text-gray-600 text-sm">CTO</p>
              </div>
            </div>
          </section>
        </div>
      </InicioLayout>
    </>
  );
}
