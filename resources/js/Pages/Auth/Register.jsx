import { Head, Link, useForm } from "@inertiajs/react";
import BotonGoogle from "@/Components/auth/Botongoogle"; // 👈 importa el botón

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-6">
            <Head title="Crear cuenta" />

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Columna izquierda: Imagen */}
                <div className="hidden md:flex md:w-1/2 bg-gray-100 relative">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                        alt="Registro"
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-8">
                        <h2 className="text-3xl font-bold text-white">
                            ¡Bienvenido a nuestra comunidad!
                        </h2>
                        <p className="text-gray-200 mt-2">
                            Regístrate y empieza a disfrutar de todos los beneficios.
                        </p>
                    </div>
                </div>

                {/* Columna derecha: Formulario */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                        Crear una cuenta
                    </h1>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Nombre */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre completo
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                                autoFocus
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                required
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                required
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                Confirmar contraseña
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                required
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* Botón + link */}
                        <div className="flex items-center justify-between">
                            <Link
                                href={route("login")}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                ¿Ya tienes una cuenta?
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                Registrarse
                            </button>
                        </div>
                    </form>

                    {/* Divider + Google */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-3 text-gray-500 text-sm">o regístrate con</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <BotonGoogle />
                </div>
            </div>
        </div>
    );
}
