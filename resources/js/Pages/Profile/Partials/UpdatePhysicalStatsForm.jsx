import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdatePhysicalStatsForm({ className = '' }) {
    const familyMember = usePage().props.familyMember;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: familyMember?.name || 'You',
        gender: familyMember?.gender || 'male',
        birth_date: familyMember?.birth_date || '',
        weight: familyMember?.weight || '',
        height: familyMember?.height || '',
        activity_level: familyMember?.activity_level || 'sedentary',
        health_goal: familyMember?.health_goal || 'maintenance',
    });

    const submit = (e) => {
        e.preventDefault();

        // Use the family update route. Ensure familyMember.id exists.
        if (familyMember?.id) {
            patch(route('family.update', familyMember.id));
        }
    };

    if (!familyMember) return null;

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Physical Stats & Goals</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update your physical attributes to recalculate your daily calorie target.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">

                {/* Gender */}
                <div>
                    <InputLabel value="Gender" />
                    <div className="flex gap-4 mt-2">
                        <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${data.gender === 'male' ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900 dark:border-emerald-400 dark:text-emerald-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            <input type="radio" name="gender" value="male" className="hidden" checked={data.gender === 'male'} onChange={() => setData('gender', 'male')} />
                            Male
                        </label>
                        <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${data.gender === 'female' ? 'bg-pink-100 border-pink-500 text-pink-700 dark:bg-pink-900 dark:border-pink-400 dark:text-pink-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            <input type="radio" name="gender" value="female" className="hidden" checked={data.gender === 'female'} onChange={() => setData('gender', 'female')} />
                            Female
                        </label>
                    </div>
                    <InputError className="mt-2" message={errors.gender} />
                </div>

                {/* Birth Date */}
                <div>
                    <InputLabel htmlFor="birth_date" value="Date of Birth" />
                    <TextInput
                        id="birth_date"
                        type="date"
                        className="mt-1 block w-full"
                        value={data.birth_date}
                        onChange={(e) => setData('birth_date', e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.birth_date} />
                </div>

                {/* Weight & Height */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <InputLabel htmlFor="weight" value="Weight (kg)" />
                        <TextInput
                            id="weight"
                            type="number"
                            step="0.1"
                            className="mt-1 block w-full"
                            value={data.weight}
                            onChange={(e) => setData('weight', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.weight} />
                    </div>
                    <div className="flex-1">
                        <InputLabel htmlFor="height" value="Height (cm)" />
                        <TextInput
                            id="height"
                            type="number"
                            step="0.1"
                            className="mt-1 block w-full"
                            value={data.height}
                            onChange={(e) => setData('height', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.height} />
                    </div>
                </div>

                {/* Activity Level */}
                <div>
                    <InputLabel htmlFor="activity_level" value="Activity Level" />
                    <select
                        id="activity_level"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-emerald-500 dark:focus:border-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 rounded-md shadow-sm"
                        value={data.activity_level}
                        onChange={(e) => setData('activity_level', e.target.value)}
                    >
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Lightly Active</option>
                        <option value="moderate">Moderately Active</option>
                        <option value="active">Active</option>
                        <option value="very_active">Very Active</option>
                    </select>
                    <InputError className="mt-2" message={errors.activity_level} />
                </div>

                {/* Health Goal */}
                <div>
                    <InputLabel htmlFor="health_goal" value="Health Goal" />
                    <select
                        id="health_goal"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-emerald-500 dark:focus:border-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 rounded-md shadow-sm"
                        value={data.health_goal}
                        onChange={(e) => setData('health_goal', e.target.value)}
                    >
                        <option value="loss">Weight Loss</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="gain">Muscle Gain</option>
                        <option value="growth">Growth (Child)</option>
                    </select>
                    <InputError className="mt-2" message={errors.health_goal} />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
