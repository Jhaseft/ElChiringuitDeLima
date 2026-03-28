import { Link } from "@inertiajs/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function DesktopNav({ links, user, userMenu, setUserMenu }) {
  return (
    <nav className="hidden md:flex items-center space-x-8 font-medium">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="relative group text-gray-300 hover:text-yellow-400 transition-colors px-2 py-1"
        >
          {link.name}
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ))}

 

      {!user ? (
        <a
          href="/login"
          className="relative group text-gray-300 hover:text-yellow-400 transition-colors px-2 py-1"
        >
          Iniciar Sesión
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ) : (
        <div className="relative">
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-1 text-gray-300 font-semibold hover:text-yellow-400 transition-colors px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {`${user.first_name} ${user.last_name}` || "Usuario"}
            {userMenu ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {userMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg border border-yellow-400 animate-fade-slide z-50">
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
