import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import IconInput from '@/Components/IconInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SocialButton from '@/Components/SocialButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h2>
                <p className="mt-2 text-sm text-emerald-600 font-medium">
                    Please enter your details to sign in.
                </p>
            </div>

            {status && <div className="mb-4 font-medium text-sm text-emerald-600">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</div>
                    <IconInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@email.com"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                            </svg>
                        }
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</div>
                    <IconInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter your password"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                        }
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
                        >
                            Forgot Password?
                        </Link>
                    )}
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>

                <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or login with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <SocialButton
                        label="Google"
                        icon={
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21.35 11.1H12V12.9H21C20.85 17.5 17.3 21 12 21C7.05 21 3 16.95 3 12C3 7.05 7.05 3 12 3C14.25 3 16.3 3.8 17.9 5.05L19.5 3.45C17.55 1.7 14.9 0.6 12 0.6C5.7 0.6 0.6 5.7 0.6 12C0.6 18.3 5.7 23.4 12 23.4C18.3 23.4 23.4 18.3 23.4 12C23.4 11.7 23.35 11.4 21.35 11.1Z" className="fill-slate-500" />
                                <path d="M21.35 11.1H12V12.9H21C20.85 17.5 17.3 21 12 21C7.05 21 3 16.95 3 12C3 7.05 7.05 3 12 3C14.25 3 16.3 3.8 17.9 5.05L19.5 3.45C17.55 1.7 14.9 0.6 12 0.6C5.7 0.6 0.6 5.7 0.6 12C0.6 18.3 5.7 23.4 12 23.4C18.3 23.4 23.4 18.3 23.4 12C23.4 11.7 23.35 11.4 21.35 11.1Z" fill="#757575" />
                            </svg>
                        }
                    />
                    <SocialButton
                        label="Apple"
                        icon={
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.5 12.6C17.5 15.65 20.1 16.7 20.2 16.75C20.15 16.95 19.8 18.15 18.9 19.45C18.15 20.55 17.35 21.6 16.15 21.6C14.95 21.6 14.6 20.9 13.2 20.9C11.8 20.9 11.4 21.6 10.3 21.6C9.15 21.6 8.3 20.5 7.45 19.3C5.7 16.75 4.35 12.1 6.1 9.05C6.95 7.55 8.5 6.6 10.1 6.6C11.25 6.6 12.35 7.35 13.05 7.35C13.75 7.35 15.35 6.4 16.65 6.4C17.2 6.4 18.7 6.6 19.8 8.2C19.7 8.25 17.5 9.5 17.5 12.6ZM13.8 4.55C14.3 3.9 14.7 3 14.6 2.1C13.7 2.15 12.65 2.7 12 3.45C11.45 4.1 11.1 5.05 11.2 5.9C12.15 5.95 13.25 5.3 13.8 4.55Z" fill="#BXB8B9" />
                            </svg>
                        }
                    />
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-bold text-emerald-600 hover:text-emerald-500"
                    >
                        Sign Up
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
