import { XMarkIcon } from "@heroicons/react/24/outline";

export default function DesktopNav({ links, user, userMenu, setUserMenu }) {
  return (
    <nav className="hidden md:flex space-x-8 items-center font-medium">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="relative group text-gray-800 hover:text-blue-600 transition-colors"
        >
          {link.name}
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ))}

      {!user ? (
        <a
          href="/login"
          className="relative group text-gray-800 hover:text-blue-600 transition"
        >
          Iniciar Sesión
          <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
        </a>
      ) : (
        <div className="relative">
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="text-gray-800 font-semibold hover:text-blue-600 transition"
          >
            {user.name || "Usuario"}
          </button> 

          {userMenu && ( 
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-lg border animate-fade-slide z-50">
              <div className="absolute -top-2 right-5 w-4 h-4 bg-white rotate-45 border-l border-t"></div>

              <div className="flex justify-end p-2">
                <button
                  onClick={() => setUserMenu(false)}
                  className="p-1 rounded hover:bg-gray-100 transition"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <a
                href="/perfil"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 transition"
              >
                Perfil
              </a>
              <a
                href="/logout"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 transition"
              >
                Cerrar Sesión
              </a>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
