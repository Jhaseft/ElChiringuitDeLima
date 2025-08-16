import { Head } from '@inertiajs/react';
import InicioLayout from '@/Layouts/Inicio/InicioLayout';
import CambioDivisasCard from '@/Components/inicio/CambioDivisasCard';
import InfoAdicionalCard from '@/Components/inicio/InfoAdicionalCard';
import Grafico from '@/Components/inicio/Grafico';

export default function Welcome() {
  return (
    <>
      <Head title="Inicio" />
      <InicioLayout>
        <div className="flex flex-col gap-6">
          {/* Gráfico arriba */}
          <div className="w-full bg-white rounded-xl shadow-lg p-4">
            <Grafico />
          </div>

          {/* Cards lado a lado en PC, vertical en móvil */}
          <div className="flex flex-col md:flex-row gap-6">
            <CambioDivisasCard />
            <InfoAdicionalCard />
          </div>
        </div>
      </InicioLayout>
    </>
  );
}
