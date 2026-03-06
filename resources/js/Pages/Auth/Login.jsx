import { Head, Link, useForm } from "@inertiajs/react";
import BotonGoogle from "@/Components/auth/Botongoogle"; //  importa el botón

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-10">
            <Head title="Iniciar sesión" />

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border-2 border-green-600 overflow-hidden flex flex-col md:flex-row">

                <div className="hidden md:flex md:w-1/2 bg-gray-100 relative">
                    <img
                        src="https://images.unsplash.com/photo-1507842217343-583bb7270b66"
                        alt="Login"
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                        <h2 className="text-3xl font-bold text-white">
                            Bienvenido de nuevo
                        </h2>
                        <p className="text-gray-200 mt-2">
                            Ingresa a tu cuenta y continúa donde lo dejaste.
                        </p>
                    </div>
                </div>


                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">

                    <div className="flex flex-col items-center mb-6">
                        <a href="/" className="hover:opacity-75 transition-opacity">
                            <img
                                src="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png"
                                alt="TransferCash"
                                className="h-16 w-auto"
                            />
                        </a>
                        <h1 className="text-2xl font-extrabold text-gray-900 mt-3">
                            Iniciar sesión
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Accede a tu cuenta TransferCash</p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 bg-green-100 px-4 py-2 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">

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
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-green-600 focus:ring focus:ring-green-100"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>


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
                                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-green-600 focus:ring focus:ring-green-100"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>




                        <div className="flex items-center justify-between">
                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="text-sm text-green-700 hover:text-green-900"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-green-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:bg-green-800 transition disabled:opacity-50"
                            >
                                Ingresar
                            </button>
                        </div>


                        <p className="text-sm text-gray-600 text-center mt-4">
                            ¿No tienes cuenta?{" "}
                            <Link
                                href={route("register")}
                                className="text-green-700 font-medium hover:text-green-900"
                            >
                                Regístrate aquí
                            </Link>
                        </p>
                    </form>

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
