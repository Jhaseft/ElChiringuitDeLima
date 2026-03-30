import { useForm, Link } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
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
                    Verify Email
                </h2>

                <p className="text-gray-300 mb-4 text-sm">
                    Thanks for signing up! Before getting started, please verify
                    your email address by clicking on the link we just emailed.
                </p>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 text-sm font-medium text-green-400">
                        A new verification link has been sent to your email address.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded-md hover:bg-yellow-500 transition"
                    >
                        Resend Verification Email
                    </button>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full text-center text-gray-300 underline hover:text-yellow-400 py-2 rounded-md border border-gray-600 hover:border-yellow-400"
                    >
                        Log Out
                    </Link>
                </form>
            </div>
        </div>
    );
}
