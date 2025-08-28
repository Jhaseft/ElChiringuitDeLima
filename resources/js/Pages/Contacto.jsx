import { Head } from "@inertiajs/react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";
import { FaWhatsapp } from "react-icons/fa";

export default function Contacto() {
  const numerosBolivia = [
    "59177958109",
    "59175995613",
    "59176925774",
    "59169325874",
  ];
  const numerosPeru = ["51907844210"];

  const renderCards = (numeros, pais, color) => (
    <div className="mb-8">
      <h2 className={`text-3xl font-bold mb-4 text-${color}-700`}>{pais}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {numeros.map((num) => (
          <a
            key={num}
            href={`https://wa.me/${num}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-3 p-6 bg-${color}-100 hover:bg-${color}-200 rounded-xl shadow-lg transition transform hover:scale-105`}
          >
            <FaWhatsapp className={`text-${color}-600 w-8 h-8`} />
            <span className="text-xl font-semibold">{num}</span>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head title="Transfer Cash" />
      <InicioLayout>
        <div className="max-w-6xl mx-auto p-8">
          <h1 className="text-4xl font-extrabold mb-8 text-center">
            Contacto Rápido
          </h1>

          {renderCards(numerosBolivia, "Bolivia", "green")}
          {renderCards(numerosPeru, "Perú", "yellow")}
        </div>
      </InicioLayout>
    </>
  );
}
