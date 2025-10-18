import Reproductor from "@/Components/AppNative/Reproductor";

export default function Telefono({ videoSrc }) {
  return (
    <div className="relative flex justify-center items-center w-full mt-6 md:mt-0 h-[500px] md:h-[600px]">
      
      {/* 🌟 Resplandor verde armonioso con el botón */}
      <div className="absolute inset-0 flex justify-center items-center z-0">
        {/* Círculo grande suave con verde degradado similar al botón */}
        <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#0de22a]/40 via-[#00a82d]/30 to-[#154b1b]/20 filter blur-4xl animate-pulse"></div>
        {/* Capa adicional más pequeña para profundidad */}
        <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#0de22a]/50 via-[#00a82d]/40 to-[#154b1b]/30 filter blur-3xl animate-pulse"></div>
      </div>

      {/* Contenedor del teléfono centrado */}
      <div className="relative w-[80%] max-w-[300px] min-w-[200px] aspect-[9/16] z-10">
        
        {/* Pantalla interna del teléfono */}
        <div className="absolute top-[2%] left-[9%] w-[82%] h-[96%] overflow-hidden rounded-[25px] border-2 border-gray-800 z-20">
          <Reproductor src={videoSrc} />
        </div>

        {/* Marco exterior del teléfono */}
        <img
          src="https://res.cloudinary.com/dnbklbswg/image/upload/v1755141820/marco-telefono_eraje7.png"
          alt="Carcasa de teléfono"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-auto pointer-events-none z-30"
        />
      </div>
    </div>
  );
}
