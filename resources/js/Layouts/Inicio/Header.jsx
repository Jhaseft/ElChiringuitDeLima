import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import DesktopNav from "@/Layouts/Inicio/DesktopNav";
import MobileNav from "@/Layouts/Inicio/MobileNav";

export default function Header() {
  const { auth } = usePage().props;
  const user = auth?.user ?? null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const links = [
    { name: "Inicio", href: "/" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
  ];

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white fixed top-0 left-0 w-full shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <a href="/">
          <img
            src="https://d500.epimg.net/cincodias/imagenes/2015/05/08/pyme/1431098283_691735_1431098420_noticia_normal.jpg"
            alt="Logo"
            className="h-12 hover:scale-105 transition-transform duration-300"
          />
        </a>

        {/* Navegación escritorio */}
        <DesktopNav
          links={links}
          user={user} // Pasamos el usuario directamente
          userMenu={userMenu}
          setUserMenu={setUserMenu}
        />

        {/* Botón menú móvil */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            {menuOpen ? (
              <XMarkIcon className="h-8 w-8 text-gray-800 rotate-90 transition-transform duration-300" />
            ) : (
              <Bars3Icon className="h-8 w-8 text-gray-800 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Fondo móvil */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Navegación móvil */}
      <MobileNav
        links={links}
        user={user} // Pasamos el usuario directamente
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

    </header>
  );
}
