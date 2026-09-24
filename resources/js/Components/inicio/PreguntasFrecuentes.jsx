import { motion } from "framer-motion";
import {
  UserPlus,
  ShieldCheck,
  BadgeCheck,
  Banknote,
  Globe2,
  CreditCard,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const faqs = [
  {
    icon: UserPlus,
    pregunta: "¿Necesito crear una cuenta para operar con ustedes?",
    respuesta:
      "Sí, el registro es obligatorio. Nos permite verificar tu identidad y confirmar que la cuenta bancaria que usas en la operación te pertenece a ti.",
  },
  {
    icon: ShieldCheck,
    pregunta: "¿Por qué piden tantos datos antes de cambiar?",
    respuesta:
      "Tu seguridad es la prioridad. Solicitamos tu documento de identidad y, en algunos casos, una verificación adicional, para confirmar que la operación la realiza el titular y así proteger tus fondos.",
  },
  {
    icon: BadgeCheck,
    pregunta: "¿Es Transfer Cash una empresa confiable?",
    respuesta:
      "Es normal tener dudas al mover dinero entre países. Somos una plataforma especializada en cambio de divisas entre Perú y Bolivia, con procesos transparentes y asesores reales disponibles por WhatsApp para resolver cualquier consulta antes de operar.",
  },
  {
    icon: Banknote,
    pregunta: "¿Puedo realizar operaciones en efectivo?",
    respuesta:
      "La mayoría de nuestras operaciones son 100% digitales, pero también contamos con una oficina física en Cochabamba para quienes prefieren gestionar su cambio en efectivo.",
  },
  {
    icon: Globe2,
    pregunta: "¿A qué países puedo enviar dinero?",
    respuesta:
      "Por el momento Transfer Cash opera principalmente entre Perú y Bolivia, sin embargo, estamos expandiendo nuestros servicios a otros países en el futuro y pronto estarán disponibles los cambios y transferencias para otros países.",
  },
  {
    icon: CreditCard,
    pregunta: "¿Puedo pagar con tarjeta de crédito o débito?",
    respuesta:
      "Por seguridad, no procesamos pagos directos con tarjetas. Así evitamos exponer tu información financiera y reducimos el riesgo de fraude en cada operación.",
  },
];

export default function PreguntasFrecuentes({ orden }) {
  const lista = orden ? orden.map((i) => faqs[i]) : faqs;

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={stagger}
      className="max-w-5xl mx-auto w-full"
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="text-center mb-10">
        <span className="inline-block text-[11px] font-semibold tracking-wider text-yellow-400 uppercase bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1 mb-3">
          Preguntas frecuentes
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          ¿Tienes <span className="text-yellow-400">dudas</span>?
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5">
        {lista.map(({ icon: Icon, pregunta, respuesta }) => (
          <motion.div
            key={pregunta}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="flex gap-4 bg-gray-800/80 border border-gray-700 hover:border-yellow-400 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-yellow-400/10">
              <Icon className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1.5">{pregunta}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{respuesta}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
