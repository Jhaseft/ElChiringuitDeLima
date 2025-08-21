import { Head } from '@inertiajs/react';
import InicioLayout from '@/Layouts/Inicio/InicioLayout';
import CambioDivisasCard from '@/Components/inicio/CambioDivisasCard';
import InfoAdicionalCard from '@/Components/inicio/InfoAdicionalCard';
import { useState} from "react";

import Grafico from '@/Components/inicio/Grafico';


export default function Welcome() {

const [tasas, setTasas] = useState({ buy: 6, sale: 7 }); // valores iniciales

  return (
    <>
      <Head title="Transfer Cash" />
      <InicioLayout>
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-4">
          {/* Gráfico arriba */}
          <div className="w-full bg-white flex rounded-xl shadow-lg p-4 justify-center">
            <Grafico setTasas={setTasas}/>
          </div>

          {/* Cards lado a lado en desktop, vertical en móvil */}
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <CambioDivisasCard tasas={tasas} />
            <InfoAdicionalCard />
          </div>
        </div>
      </InicioLayout>
    </>
  );
}
