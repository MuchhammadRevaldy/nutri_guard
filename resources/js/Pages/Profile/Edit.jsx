import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePhysicalStatsForm from './Partials/UpdatePhysicalStatsForm';
import UpdateProfilePhotoForm from './Partials/UpdateProfilePhotoForm';
import { Head } from '@inertiajs/react';
import RevealOnScroll from '@/Components/RevealOnScroll';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Profile</h2>}
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-2xl animate-fade-in-up">
                        <UpdateProfilePhotoForm />
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-2xl animate-fade-in-up animation-delay-100">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <RevealOnScroll>
                        <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-2xl">
                            <UpdatePhysicalStatsForm />
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll>
                        <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-2xl">
                            <UpdatePasswordForm />
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll>
                        <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-2xl">
                            <DeleteUserForm />
                        </div>
                    </RevealOnScroll>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
