import { useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 px-4">
            <img
                src="https://res.cloudinary.com/dnbklbswg/image/upload/v1772202747/logo_n6nqqr__2_-removebg-preview_qngiau.png"
                alt="Logo"
                className="w-32 mb-6"
            />

            <div className="max-w-md w-full bg-gray-800 border border-yellow-400 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-white">
                    Confirm Password
                </h2>

                <p className="text-gray-300 mb-4 text-sm">
                    This is a secure area of the application. Please confirm your password before continuing.
                </p>

                <form onSubmit={submit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400"
                        required
                    />
                    {errors.password && (
                        <p className="text-red-400 text-sm">{errors.password}</p>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded-md hover:bg-yellow-500 transition"
                    >
                        Confirm
                    </button>
                </form>
            </div>
        </div>
    );
}
