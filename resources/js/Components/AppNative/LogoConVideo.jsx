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

      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full md:w-1/2 flex flex-col items-center text-center space-y-6 md:space-y-8 max-w-[600px] md:max-w-none flex-shrink-0 md:justify-center md:h-full overflow-auto"
      >
        <p className="text-2xl  text-white font-extrabold sm:text-xl md:text-6xl font-montserrat leading-snug sm:leading-tight max-w-[600px] mx-auto">
          ¡La App que <span className="text-yellow-400">Transfiere tu Dinero</span> al Instante!
        </p>

        <img
          src={logoSrc}
          alt="logo transfer cash"
          className="w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[220px] h-auto"
        />

        {children}

        <a
          href="https://play.google.com/store/apps/details?id=com.transfercash.lima"
          download
          className="flex items-center  rounded-lg"
        >
          <img
            src="/images/google-play-badge-es.png"
            alt="Google Play"
            className="w-52 h-16"
          />

        </a>

      </motion.div>

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
