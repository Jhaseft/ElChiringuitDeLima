// InicioLayout.jsx
import Header from "@/Layouts/Inicio/Header";
import ChatWidget from "@/Layouts/Inicio/ChatWidget";

export default function InicioLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <main className="flex-1 pt-2 flex items-start justify-center p-2 md:p-1">
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 mt-[110px]">
          {children}
        </div>
      </main>
      <ChatWidget />
    </div>
  );
}
