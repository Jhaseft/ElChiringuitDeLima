import ApplicationLogo from '@/Components/auth/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 py-6">
            
            {/* Logo */}
            <div className="mb-8">
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24 md:h-28 md:w-28 transition-transform duration-300 hover:scale-105" />
                </Link>
            </div>

            {/* Contenedor del formulario */}
            <div className="w-full  bg-white px-2 py-6 shadow-lg rounded-2xl transition-transform duration-300 hover:scale-[1.02]">
                {children}
            </div>

            {/* Pie de página opcional */}
            <div className="mt-6 text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} TuEmpresa. Todos los derechos reservados.
            </div>
        </div>
    );
}
