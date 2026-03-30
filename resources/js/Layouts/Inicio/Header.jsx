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

  //  Links base
  const links = [
    { name: "Inicio", href: "/" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
    { name: "Descargar App", href: "/App" },
  ];

  return (
    <header className="bg-gray-800/90 backdrop-blur-sm fixed top-0 left-0 w-full shadow-md z-50 border-b border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-">
    
        <a href="/" className="flex items-center">
          <img
            src="https://res.cloudinary.com/dxa8nat3p/image/upload/v1774709575/Logo_Web_cjmgei.png"
            alt="Logo"
            className="h-20 w-auto hover:scale-105 transition-transform duration-300"
          />
        </a>

      
        <DesktopNav
          links={links}
          user={user}
          userMenu={userMenu}
          setUserMenu={setUserMenu}
        />

     
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {menuOpen ? (
              <XMarkIcon className="h-8 w-8 text-white rotate-90 transition-transform duration-300" />
            ) : (
              <Bars3Icon className="h-8 w-8 text-white transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      <MobileNav
        links={links}
        user={user}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
    </header>
  );
}
