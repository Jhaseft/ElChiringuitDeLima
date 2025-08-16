import Header from "@/Layouts/Inicio/Header";
import BotonWhatsApp from "@/Layouts/Inicio/BotonWhatsap";

export default function InicioLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <BotonWhatsApp />
    </div>    
  );
}
