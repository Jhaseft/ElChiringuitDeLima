import { Link } from "@inertiajs/react";
import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function MobileNav({ links, user, menuOpen, setMenuOpen }) {
  const [userMenu, setUserMenu] = useState(false);

  return (
    <div
      className={`absolute top-16 left-0 w-full bg-white border-t border-gray-200 shadow-xl overflow-hidden transition-all duration-300 md:hidden ${
        menuOpen ? "max-h-96 animate-fade-slide" : "max-h-0"
      }`}
    >
      <div className="flex flex-col p-4 space-y-3">
        {/* Links principales */}
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="block text-lg font-medium text-gray-800 hover:text-white hover:bg-blue-600 rounded-lg px-3 py-2 transition-all"
            onClick={() => setMenuOpen(false)}
          >
            {link.name}
          </a>
        ))}

        {/* Autenticación */}
        {!user ? (
          <a
            href="/login"
            className="block text-lg font-medium text-gray-800 hover:text-white hover:bg-blue-600 rounded-lg px-3 py-2 transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Iniciar Sesión
          </a>
        ) : (
          <div className="relative">
            {/* Botón usuario */}
            <button
              onClick={() => setUserMenu(!userMenu)}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-800 font-medium hover:text-white hover:bg-blue-600 rounded-lg border border-gray-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {user.name || "Usuario"}
              {userMenu ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>

            {/* Dropdown usuario */}
            {userMenu && (
              <div className="mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-slide">
                <Link
                  href={route("logout")}
                  method="post"
                  as="button"
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded"
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
