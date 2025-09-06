import { Head } from "@inertiajs/react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";
import { FaWhatsapp } from "react-icons/fa";

export default function Contacto() {
  const numerosBolivia = ["59177958109"];
  const numerosPeru = ["51907844210"];

  const renderCards = (numeros, pais, color) => (
    <div className="mb-12 w-full flex flex-col items-center">
      <h2 className={`text-3xl font-bold mb-6 text-${color}-700 text-center`}>
        {pais}
      </h2>
      <div className="flex flex-col items-center gap-8">
        {numeros.map((num) => (
          <a
            key={num}
            href={`https://wa.me/${num}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-3 p-8 bg-${color}-100 hover:bg-${color}-200 rounded-2xl shadow-lg transition-transform transform hover:scale-105 w-60`}
          >
            <FaWhatsapp className={`text-${color}-600 w-12 h-12`} />
            <span className="text-2xl font-bold text-center text-gray-800">
              {num}
            </span>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head title="Transfer Cash - Contacto" />
      <InicioLayout>
        <div className="max-w-6xl mx-auto p-8 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold mb-12 text-center">
            Contacto Rápido
          </h1>

          {renderCards(numerosBolivia, "Bolivia", "green")}
          {renderCards(numerosPeru, "Perú", "yellow")}
        </div>
      </InicioLayout>
    </>
  );
}
