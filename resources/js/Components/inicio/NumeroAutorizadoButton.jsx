import { MessageCircle } from "lucide-react";

export default function NumeroAutorizadoButton({ nombre, numero }) {
  const link = `https://wa.me/${numero}?text=Hola,%20necesito%20información`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition text-sm font-medium"
    >
      <MessageCircle size={18} />
      {nombre} {/* Ahora se muestra el nombre en lugar del número */}
    </a>
  );
}
