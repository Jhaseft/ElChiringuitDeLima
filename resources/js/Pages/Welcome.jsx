import { Head } from '@inertiajs/react';
import InicioLayout from '@/Layouts/Inicio/InicioLayout';
import CambioDivisasCard from '@/Components/inicio/CambioDivisasCard';
import InfoAdicionalCard from '@/Components/inicio/InfoAdicionalCard';
import { useState } from "react";
import Grafico from '@/Components/inicio/Grafico';

export default function Welcome() {
  const [tasas, setTasas] = useState({ buy: 6, sale: 7 }); // valores iniciales

  return (
    <>
      <Head title="Transfer Cash" />
      <InicioLayout>
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4">

          {/* Cards juntas arriba */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="flex-1 min-w-[250px]">
              <CambioDivisasCard tasas={tasas} />
            </div>
            <div className="flex-1 min-w-[250px]">
              <InfoAdicionalCard />
            </div>
          </div>

          {/* Gráfico abajo */}
          <div className="w-full bg-white flex justify-center rounded-xl shadow-lg p-4">
            <div className="w-full sm:w-11/12 lg:w-4/5">
              <Grafico setTasas={setTasas}/>
            </div>
          </div>

        </div>
      </InicioLayout>
    </>
  );
}
