import { Link } from "@inertiajs/react";
import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function MobileNav({ links, user, menuOpen, setMenuOpen }) {
  const [userMenu, setUserMenu] = useState(false);

  return (
    <div
      className={`absolute top-18 left-0 w-full bg-gray-800 border-t border-yellow-400 shadow-xl overflow-hidden transition-all duration-300 md:hidden ${
        menuOpen ? "max-h-96 animate-fade-slide" : "max-h-0"
      }`}
    >
      <div className="flex flex-col p-4 space-y-3">
        {/* Links principales */}
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="block text-lg font-medium text-gray-300 hover:text-gray-900 hover:bg-yellow-400 rounded-lg px-3 py-2 transition-all"
            onClick={() => setMenuOpen(false)}
          >
            {link.name}
          </a>
        ))}

        {/* Autenticación */}
        {!user ? (
          <a
            href="/login"
            className="block text-lg font-medium text-gray-300 hover:text-gray-900 hover:bg-yellow-400 rounded-lg px-3 py-2 transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Iniciar Sesión
          </a>
        ) : (
          <div className="relative">
            {/* Botón usuario */}
            <button
              onClick={() => setUserMenu(!userMenu)}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-300 font-medium hover:text-gray-900 hover:bg-yellow-400 rounded-lg border border-yellow-400 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {`${user.first_name} ${user.last_name}` || "Usuario"}
              {userMenu ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>

            {/* Dropdown usuario */}
            {userMenu && (
              <div className="mt-2 w-full bg-gray-700 rounded-lg shadow-lg border border-yellow-400 animate-fade-slide">
                <Link
                href={route("transfers.history")} 
                className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-yellow-400 transition-all rounded"
                onClick={() => setUserMenu(false)}
              >
                Ver Historial
              </Link>


                <Link
                  href={route("logout")}
                  method="post"
                  as="button"
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-yellow-400 transition-all rounded"
                  onClick={() => {
                    setUserMenu(false);
                    setMenuOpen(false);
                  }}
                >
                  Cerrar Sesión
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
