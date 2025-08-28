import { Head } from "@inertiajs/react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";
import CambioDivisasCard from "@/Components/inicio/CambioDivisasCard";
import InfoAdicionalCard from "@/Components/inicio/InfoAdicionalCard";
import { useState } from "react";
import Grafico from "@/Components/inicio/Grafico";

export default function Welcome({ bancos }) {
  const [tasas, setTasas] = useState({ buy: 6, sale: 7 });

  return (
    <>
      <Head title="Transfer Cash" />
      <InicioLayout>
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4  lg:py-10">
          {/* Cards arriba */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CambioDivisasCard tasas={tasas} bancos={bancos} />
           <InfoAdicionalCard />
          </div>
          

          {/* Gráfico abajo */}
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full">
            <div className="w-full sm:w-11/12 lg:w-4/5 mx-auto">
              <Grafico setTasas={setTasas} />
            </div>
          </div>
        </div>
      </InicioLayout>
    </>
  );
}
