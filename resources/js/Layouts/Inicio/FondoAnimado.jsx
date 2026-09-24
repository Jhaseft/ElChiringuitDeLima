import { motion } from "framer-motion";

/**
 * Fondo con degradado base + resplandores animados (estilo "aurora") + grilla sutil.
 * Puramente decorativo: absoluto, sin interacción, detrás de todo el contenido.
 */
export default function FondoAnimado() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #111827 0%, #0b0f19 100%)",
        }}
      />

      {/* Grilla sutil */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* Resplandores animados */}
      <motion.div
        className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-yellow-400/15 blur-[110px]"
        animate={{ x: [0, 70, -30, 0], y: [0, 50, -20, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-24 right-[-180px] w-[520px] h-[520px] rounded-full bg-blue-500/12 blur-[110px]"
        animate={{ x: [0, -60, 30, 0], y: [0, 40, -40, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute bottom-[-200px] left-1/3 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[130px]"
        animate={{ x: [0, 50, -70, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}
