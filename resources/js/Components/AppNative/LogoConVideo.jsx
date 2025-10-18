import { motion } from "framer-motion";
import Telefono from "@/Components/AppNative/Telefono";
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid'; // 📥 Icono de descarga

export default function LogoConVideo({
  logoSrc,
  children,
  linkText = "Descargar",
  videoSrc
}) {
  return (
    <>
      {/* IZQUIERDA */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full md:w-1/2 flex flex-col items-center text-center space-y-6 md:space-y-8 max-w-[600px] md:max-w-none flex-shrink-0 md:justify-center md:h-full overflow-auto"
      >
        <p className="text-2xl  text-black font-extrabold sm:text-xl md:text-6xl font-montserrat leading-snug sm:leading-tight max-w-[600px] mx-auto">
          ¡La App que Transfiere tu Dinero al Instante!
        </p>

        {/* Logo */}
        <img
          src={logoSrc}
          alt="logo corte beniano"
          className="w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[220px] h-auto"
        />

        {/* Contenido dinámico */}
        {children}

        {/* Botón de descarga con ícono */}
        <a
          href="/TransferCash.apk"
          download
          className="bg-gradient-to-r from-[#0de22a] via-[#00a82d] to-[#154b1b] 
                     hover:from-[#00c738] hover:to-[#0a3d13] text-black font-bold tracking-widest 
                     py-3 px-10 sm:py-4 sm:px-16 rounded-full shadow-lg transition-all duration-300 text-base sm:text-lg md:text-[25px] font-montserrat flex items-center justify-center gap-3"
        >
          <span className="md:p-2 p-1">{linkText}</span>
          <ArrowDownTrayIcon className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
        </a>
      </motion.div>

      {/* DERECHA */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full md:w-1/2 flex items-center justify-center text-center"
      >
        <Telefono videoSrc={videoSrc} />
      </motion.div>
    </>
  );
}
