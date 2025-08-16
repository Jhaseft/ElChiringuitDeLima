export default function NumeroAutorizadoButton({ numero }) {
  return (
    <button className="bg-green-700 text-white py-1 px-2 rounded text-sm hover:bg-green-800 transition">
      {numero} Chat
    </button>
  );
}
