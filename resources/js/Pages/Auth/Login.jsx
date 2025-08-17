import { Head, Link, useForm } from "@inertiajs/react";
import BotonGoogle from "@/Components/auth/Botongoogle"; // 👈 importa el botón

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-6">
            <Head title="Iniciar sesión" />

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Columna izquierda: Imagen */}
                <div className="hidden md:flex md:w-1/2 bg-gray-100 relative">
                    <img
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66"
                        alt="Login"
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                        <h2 className="text-3xl font-bold text-white">
                            Bienvenido de nuevo 👋
                        </h2>
                        <p className="text-gray-200 mt-2">
                            Ingresa a tu cuenta y continúa donde lo dejaste.
                        </p>
                    </div>
                </div>

                {/* Columna derecha: Formulario */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                        Iniciar sesión
                    </h1>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 bg-green-100 px-4 py-2 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
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
                                autoFocus
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
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

                        {/* Remember me */}
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData("remember", e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                                Recuérdame
                            </label>
                        </div>

                        {/* Botón + link */}
                        <div className="flex items-center justify-between">
                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                Ingresar
                            </button>
                        </div>

                        {/* Registro */}
                        <p className="text-sm text-gray-600 text-center mt-4">
                            ¿No tienes cuenta?{" "}
                            <Link
                                href={route("register")}
                                className="text-indigo-600 font-medium hover:text-indigo-800"
                            >
                                Regístrate aquí
                            </Link>
                        </p>
                    </form>

                    {/* Divider + Google */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-3 text-gray-500 text-sm">o continúa con</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <BotonGoogle />
                </div>
            </div>
        </div>
    );
}
