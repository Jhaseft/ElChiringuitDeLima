import { Head } from "@inertiajs/react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";
import { usePage } from "@inertiajs/react";
import CambioDivisasCard from "@/Components/inicio/CambioDivisasCard";
import InfoAdicionalCard from "@/Components/inicio/InfoAdicionalCard";
import { useState } from "react";
import Grafico from "@/Components/inicio/Grafico";
import FooterLayout from "@/Layouts/footer";

export default function Welcome({ bancos, tasas: tasasInicial, transferConfig , TrMethods }) {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;
  const [tasas, setTasas] = useState(tasasInicial ?? { compra: 0, venta: 0 });

  return (
    <>
      <Head title="Transfer Cash" />
      <InicioLayout animatedBg>

        <div className="flex  flex-col gap-8 w-full max-w-7xl mx-auto px-4  lg:py-10">

           {user && (
                    <div className="  justify-center items-center md:mb-10 mb-5">

            <p className=" text-center md:text-2xl text-xl font-bold text-white">
              Bienvenido, {user.first_name} {user.last_name}
            </p>

          </div>
                  )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Grafico setTasas={setTasas} />
            <CambioDivisasCard tasas={tasas} bancos={bancos} transferConfig={transferConfig} metodosPago={TrMethods} />
          </div>

          <InfoAdicionalCard />
        </div>
      </InicioLayout>
      <FooterLayout />
    </>
  );
}
