import { Head } from "@inertiajs/react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";

export default function Nosotros() {
  return (
    <>
      <Head title="Transfer Cash - Nosotros" />
      <InicioLayout>
        <div className="min-h-screen bg-gray-900 px-4 lg:px-52 py-1 ">
          
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-10">
            <img
              src="https://res.cloudinary.com/dxa8nat3p/image/upload/v1774711190/Portada_Web_dojpcy.png"
              alt="Transfer Cash"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Sobre Transfer Cash
              </h1>
            </div>
          </div>

    
          <section className="max-w-4xl mx-auto mb-10">
            <h2 className="text-2xl font-bold mb-4 text-white">Nuestra Historia</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Transfer Cash nació en 2022 con el objetivo de simplificar las
              transferencias de dinero entre Perú y Bolivia, ofreciendo un
              servicio seguro, rápido y confiable para todos nuestros usuarios.
              Desde nuestros inicios, nos enfocamos en la innovación tecnológica
              y la satisfacción del cliente.
            </p>
          </section>

         
          <section className="max-w-4xl mx-auto mb-10 grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-yellow-400">
              <h3 className="text-xl font-semibold mb-2 text-yellow-400">Misión</h3>
              <p className="text-gray-300 text-sm md:text-base">
                Facilitar transferencias de dinero seguras y rápidas, conectando
                personas y negocios a través de soluciones financieras
                innovadoras, con total transparencia y confianza.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-yellow-400">
              <h3 className="text-xl font-semibold mb-2 text-yellow-400">Visión</h3>
              <p className="text-gray-300 text-sm md:text-base">
                Ser la plataforma líder en Latinoamérica para transferencias
                electrónicas, reconocida por su seguridad, eficiencia y
                atención al cliente de excelencia.
              </p>
            </div>
          </section>

        </div>
      </InicioLayout>
    </>
  );
}
