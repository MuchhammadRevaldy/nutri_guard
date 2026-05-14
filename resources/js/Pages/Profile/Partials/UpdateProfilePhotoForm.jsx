import { useRef, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdateProfilePhotoForm({ className = '' }) {
    const user = usePage().props.auth.user;
    const [photoPreview, setPhotoPreview] = useState(null);
    const photoInput = useRef(null);

    const { data, setData, post, progress, errors, processing, recentlySuccessful } = useForm({
        avatar: null,
        _method: 'PATCH', // Spoof PATCH for file upload compat
    });

    const selectNewPhoto = () => {
        photoInput.current.click();
    };

    const updatePhotoPreview = () => {
        const photo = photoInput.current.files[0];

        if (!photo) return;

        setData('avatar', photo);

        const reader = new FileReader();

        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
        };

        reader.readAsDataURL(photo);
    };

    const deletePhoto = (e) => {
        e.preventDefault();
        // Implement delete logic if needed
        setPhotoPreview(null);
        setData('avatar', null);
    };

    const submit = (e) => {
        e.preventDefault();

        if (photoInput.current.files[0]) {
            post(route('profile.update'), {
                preserveScroll: true,
                onSuccess: () => {
                    // clear file input
                },
            });
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your account's profile information, email address, and photo.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Profile Photo */}
                <div>
                    <label className="block font-medium text-sm text-gray-700 dark:text-gray-300">Photo</label>
                    <input
                        type="file"
                        className="hidden"
                        ref={photoInput}
                        onChange={updatePhotoPreview}
                    />

                    <div className="mt-2 flex items-center gap-4">
                        {/* Current Profile Photo */}
                        {!photoPreview && (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                                {user.avatar ? (
                                    <img src={`/storage/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl text-gray-500">
                                        {user.name.charAt(0)}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* New Profile Photo Preview */}
                        {photoPreview && (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-emerald-500 ring-2 ring-emerald-200">
                                <span
                                    className="block w-full h-full bg-cover bg-no-repeat bg-center"
                                    style={{ backgroundImage: `url('${photoPreview}')` }}
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                            onClick={selectNewPhoto}
                        >
                            Select A New Photo
                        </button>

                        {user.avatar && !photoPreview && (
                            <button
                                type="button"
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-red-600 dark:text-red-400 uppercase tracking-widest shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                onClick={deletePhoto}
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                    {errors.avatar && <div className="text-red-500 text-sm mt-1">{errors.avatar}</div>}
                </div>

                <div className="flex items-center gap-4">
                    <button disabled={processing} className="px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white focus:bg-gray-700 dark:focus:bg-white active:bg-gray-900 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                        Save
                    </button>

                    {recentlySuccessful && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>
                    )}
                </div>
            </form>
        </section>
    );
}
