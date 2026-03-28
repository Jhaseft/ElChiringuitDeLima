import { useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
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
                    Forgot Password
                </h2>

                <p className="text-gray-300 mb-4 text-sm">
                    Forgot your password? No problem. Just let us know your email
                    address and we will email you a password reset link.
                </p>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-400">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400"
                        required
                    />
                    {errors.email && (
                        <p className="text-red-400 text-sm">{errors.email}</p>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded-md hover:bg-yellow-500 transition"
                    >
                        Email Password Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
}
