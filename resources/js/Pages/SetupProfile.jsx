import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';

export default function SetupProfile({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        gender: 'male',
        birth_date: '',
        weight: '',
        height: '',
        activity_level: 'sedentary',
        health_goal: 'maintenance',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.setup.store'));
    };

    return (
        <GuestLayout>
            <Head title="Setup Profile" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Let's get to know you!</h2>
                <p className="text-gray-600 dark:text-gray-400">We need some details to calculate your personalized nutrition plan.</p>
            </div>

            <form onSubmit={submit}>
                {/* Gender */}
                <div className="mt-4">
                    <InputLabel value="Gender" />
                    <div className="flex gap-4 mt-1">
                        <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${data.gender === 'male' ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900 dark:border-emerald-400 dark:text-emerald-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            <input type="radio" name="gender" value="male" className="hidden" checked={data.gender === 'male'} onChange={() => setData('gender', 'male')} />
                            Male
                        </label>
                        <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${data.gender === 'female' ? 'bg-pink-100 border-pink-500 text-pink-700 dark:bg-pink-900 dark:border-pink-400 dark:text-pink-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            <input type="radio" name="gender" value="female" className="hidden" checked={data.gender === 'female'} onChange={() => setData('gender', 'female')} />
                            Female
                        </label>
                    </div>
                </div>

                {/* Date of Birth */}
                <div className="mt-4">
                    <InputLabel htmlFor="birth_date" value="Date of Birth" />
                    <TextInput
                        id="birth_date"
                        type="date"
                        className="mt-1 block w-full"
                        value={data.birth_date}
                        onChange={(e) => setData('birth_date', e.target.value)}
                        required
                    />
                    {errors.birth_date && <div className="text-red-500 text-sm mt-1">{errors.birth_date}</div>}
                </div>

                {/* Weight & Height */}
                <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                        <InputLabel htmlFor="weight" value="Weight (kg)" />
                        <TextInput
                            id="weight"
                            type="number"
                            step="0.1"
                            className="mt-1 block w-full"
                            value={data.weight}
                            onChange={(e) => setData('weight', e.target.value)}
                            required
                        />
                        {errors.weight && <div className="text-red-500 text-sm mt-1">{errors.weight}</div>}
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
                            required
                        />
                        {errors.height && <div className="text-red-500 text-sm mt-1">{errors.height}</div>}
                    </div>
                </div>

                {/* Activity Level */}
                <div className="mt-4">
                    <InputLabel htmlFor="activity_level" value="Activity Level" />
                    <select
                        id="activity_level"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-emerald-500 dark:focus:border-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 rounded-md shadow-sm"
                        value={data.activity_level}
                        onChange={(e) => setData('activity_level', e.target.value)}
                    >
                        <option value="sedentary">Sedentary (Little or no exercise)</option>
                        <option value="light">Lightly Active (Exercise 1-3 days/week)</option>
                        <option value="moderate">Moderately Active (Exercise 3-5 days/week)</option>
                        <option value="active">Active (Exercise 6-7 days/week)</option>
                        <option value="very_active">Very Active (Physical job or hard exercise)</option>
                    </select>
                </div>

                {/* Health Goal */}
                <div className="mt-4">
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
                        {/* Growth option hidden if age > 18 in UI, but handled in backend */}
                    </select>
                </div>

                <div className="flex items-center justify-end mt-6">
                    <PrimaryButton className="ml-4 bg-emerald-500 hover:bg-emerald-600" disabled={processing}>
                        Calculate Plan & Continue
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
