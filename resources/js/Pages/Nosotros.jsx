import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  ShieldCheck,
  Zap,
  Sparkles,
  HeartHandshake,
  CalendarCheck,
  Globe2,
  Headset,
} from "lucide-react";
import InicioLayout from "@/Layouts/Inicio/InicioLayout";
import PreguntasFrecuentes from "@/Components/inicio/PreguntasFrecuentes";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const stats = [
  { icon: CalendarCheck, label: "Fundada en 2022" },
  { icon: Globe2, label: "Perú ↔ Bolivia" },
  { icon: Zap, label: "100% Digital" },
  { icon: Headset, label: "Atención personalizada" },
];

const valores = [
  {
    icon: ShieldCheck,
    titulo: "Seguridad",
    texto: "Cada operación se procesa con protocolos que protegen tu dinero y tus datos en todo momento.",
  },
  {
    icon: Zap,
    titulo: "Rapidez",
    texto: "Transferencias que se resuelven en minutos, sin filas ni trámites innecesarios.",
  },
  {
    icon: Sparkles,
    titulo: "Transparencia",
    texto: "Tasas claras y visibles desde el primer momento, sin costos ocultos ni sorpresas.",
  },
  {
    icon: HeartHandshake,
    titulo: "Confianza",
    texto: "Asesores reales acompañan cada operación, cuidando la experiencia de cada usuario.",
  },
];

export default function Nosotros() {
  return (
    <>
      <Head title="Transfer Cash - Nosotros" />
      <InicioLayout animatedBg>
        <div className="w-full px-4 lg:px-24 xl:px-40 py-2">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-16 border border-yellow-400/30 shadow-xl"
          >
            <img
              src="https://res.cloudinary.com/dxa8nat3p/image/upload/v1774711190/Portada_Web_dojpcy.png"
              alt="Transfer Cash"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-5xl font-bold text-white"
              >
                Sobre Transfer Cash
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-3 text-sm md:text-lg text-gray-300 max-w-xl"
              >
                Conectando Perú y Bolivia con transferencias rápidas, seguras y 100% digitales.
              </motion.p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-20"
          >
            {stats.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-2 bg-gray-800 border border-yellow-400/40 rounded-xl px-4 py-5 text-center shadow-md hover:border-yellow-400 hover:-translate-y-1 transition-all duration-300"
              >
                <Icon className="w-6 h-6 text-yellow-400" />
                <span className="text-xs md:text-sm font-semibold text-gray-200">
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Nuestra Historia */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-20"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white text-center">
              Nuestra Historia
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed text-center">
              Transfer Cash nació en 2022 con el objetivo de simplificar las
              transferencias de dinero entre Perú y Bolivia, ofreciendo un
              servicio seguro, rápido y confiable para todos nuestros usuarios.
              Desde nuestros inicios, nos enfocamos en la innovación tecnológica
              y la satisfacción del cliente.
            </p>
          </motion.section>

          {/* Misión y Visión */}
          <motion.section
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-4xl mx-auto mb-20 grid md:grid-cols-2 gap-6"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-yellow-400 transition hover:shadow-2xl hover:scale-[1.02] duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-400">Misión</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Facilitar transferencias de dinero seguras y rápidas, conectando
                personas y negocios a través de soluciones financieras
                innovadoras, con total transparencia y confianza.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-yellow-400 transition hover:shadow-2xl hover:scale-[1.02] duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-yellow-400/10">
                  <Eye className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-400">Visión</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Ser la plataforma líder en Latinoamérica para transferencias
                electrónicas, reconocida por su seguridad, eficiencia y
                atención al cliente de excelencia.
              </p>
            </motion.div>
          </motion.section>

          {/* Valores */}
          <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="max-w-5xl mx-auto mb-20"
          >
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-3xl font-bold mb-8 text-white text-center"
            >
              Nuestros Valores
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valores.map(({ icon: Icon, titulo, texto }) => (
                <motion.div
                  key={titulo}
                  variants={fadeUp}
                  transition={{ duration: 0.55 }}
                  className="bg-gray-800/80 border border-gray-700 hover:border-yellow-400 rounded-2xl p-5 text-center shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="w-11 h-11 mx-auto mb-3 flex items-center justify-center rounded-full bg-yellow-400/10">
                    <Icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{titulo}</h4>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    {texto}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Preguntas Frecuentes */}
          <div className="mb-20">
            <PreguntasFrecuentes />
          </div>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16 bg-gradient-to-r from-gray-800 to-gray-800/60 border border-yellow-400 rounded-2xl px-6 py-10 text-center shadow-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              ¿Listo para hacer tu primer cambio con nosotros?
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-6">
              Empieza en minutos y descubre por qué confían en Transfer Cash.
            </p>
            <Link
              href="/"
              className="inline-block bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-yellow-500 transition-colors shadow-md"
            >
              Empezar ahora
            </Link>
          </motion.section>

        </div>
      </InicioLayout>
    </>
  );
}
