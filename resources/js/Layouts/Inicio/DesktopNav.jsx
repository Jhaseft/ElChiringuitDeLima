import { Link } from "@inertiajs/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function DesktopNav({ links, user, userMenu, setUserMenu }) {
  return (
    <nav className="hidden md:flex items-center space-x-8 font-medium">
      {/* Links principales */}
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="relative group text-gray-800 hover:text-blue-600 transition-colors px-2 py-1"
        >
          {link.name}
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ))}

      {/* Autenticación */}
      {!user ? (
        <a
          href="/login"
          className="relative group text-gray-800 hover:text-blue-600 transition-colors px-2 py-1"
        >
          Iniciar Sesión
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ) : (
        <div className="relative">
          {/* Botón usuario */}
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-1 text-gray-800 font-semibold hover:text-blue-600 transition-colors px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {user.name || "Usuario"}
            {userMenu ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {/* Dropdown */}
          {userMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-slide z-50">
              <Link
                href={route("logout")}
                method="post"
                as="button"
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all rounded"
                onClick={() => setUserMenu(false)}
              >
                Cerrar Sesión
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
