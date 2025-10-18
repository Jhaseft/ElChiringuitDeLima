import { FaWhatsapp } from "react-icons/fa";


export default function BotonWhatsApp() {
  return (
    <a
      href="https://wa.me/59177958109?text=Hola%2C%20quiero%20más%20información"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 hover:bg-green-600 transition transform hover:scale-105"
    >
      <FaWhatsapp size={24} />
      <span className="hidden md:inline font-medium">¡Escríbeme!</span>
    </a>
  );
}
