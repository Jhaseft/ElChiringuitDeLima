import { Link } from "@inertiajs/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function MobileNav({ links, user, menuOpen, setMenuOpen }) {
  return (
    <nav
      className={`fixed top-0 right-0 w-2/3 max-w-xs h-full bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden ${
        menuOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <span className="text-lg font-semibold">Menú</span>
        <button
          onClick={() => setMenuOpen(false)}
          className="p-1 rounded hover:bg-gray-100 transition"
        >
          <XMarkIcon className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="block text-lg text-gray-800 hover:text-blue-600 transition"
          >
            {link.name}
          </a>
        ))}

        {!user ? (
          <a
            href="/login"
            className="block text-lg text-gray-800 hover:text-blue-600 transition"
          >
            Iniciar Sesión
          </a>
        ) : (
          <>
            <div className="text-base font-medium text-gray-800">{user.name}</div>
            <div className="text-sm font-medium text-gray-500">{user.email}</div>

            {/* ✅ Solo botón de logout */}
            <Link
              href={route("logout")}
              method="post"
              as="button"
              className="block w-full text-left text-lg text-gray-800 hover:text-blue-600 transition"
            >
              Cerrar Sesión
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
