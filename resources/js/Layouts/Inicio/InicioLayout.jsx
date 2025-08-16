// InicioLayout.jsx
import Header from "@/Layouts/Inicio/Header";
import BotonWhatsApp from "@/Layouts/Inicio/BotonWhatsap";

export default function InicioLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 pt-16 flex items-start justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 mt-32">
          {children}
        </div>
      </main>
      <BotonWhatsApp />
    </div>
  );
}
