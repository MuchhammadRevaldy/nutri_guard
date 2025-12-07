import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function ManageMembersModal({ show, onClose, members }) {
    const [editingId, setEditingId] = useState(null);
    const { data, setData, patch, delete: destroy, processing, reset } = useForm({
        name: '',
        weight: '',
        height: '',
        birth_date: '',
        gender: 'male',
        activity_level: 'sedentary',
        health_goal: 'maintenance'
    });

    const startEdit = (member) => {
        setEditingId(member.id);
        setData({
            name: member.name,
            weight: member.weight,
            height: member.height,
            birth_date: member.birth_date,
            gender: member.gender,
            activity_level: member.activity_level,
            health_goal: member.health_goal
        });
    };

    const saveEdit = (id) => {
        patch(route('family.update', id), {
            onSuccess: () => setEditingId(null),
        });
    };

    const deleteMember = (id) => {
        if (confirm('Are you sure you want to remove this member?')) {
            destroy(route('family.destroy', id));
        }
    };

    return (
        <Transition.Root show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="p-6">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                                        Manage Family Members
                                    </Dialog.Title>

                                    <div className="space-y-4">
                                        {members.map(member => (
                                            <div key={member.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                                {editingId === member.id ? (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="col-span-2">
                                                                <label className="text-xs text-gray-500">Name</label>
                                                                <TextInput
                                                                    value={data.name}
                                                                    onChange={e => setData('name', e.target.value)}
                                                                    className="w-full text-sm h-8"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500">Weight (kg)</label>
                                                                <TextInput
                                                                    value={data.weight || ''}
                                                                    type="number" step="0.1"
                                                                    onChange={e => setData('weight', e.target.value)}
                                                                    className="w-full text-sm h-8"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500">Height (cm)</label>
                                                                <TextInput
                                                                    value={data.height || ''}
                                                                    type="number" step="0.1"
                                                                    onChange={e => setData('height', e.target.value)}
                                                                    className="w-full text-sm h-8"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500">Birth Date</label>
                                                                <TextInput
                                                                    value={data.birth_date || ''}
                                                                    type="date"
                                                                    onChange={e => setData('birth_date', e.target.value)}
                                                                    className="w-full text-sm h-8"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs text-gray-500">Gender</label>
                                                                <select
                                                                    value={data.gender || 'male'}
                                                                    onChange={e => setData('gender', e.target.value)}
                                                                    className="w-full text-sm h-8 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md py-0"
                                                                >
                                                                    <option value="male">Male</option>
                                                                    <option value="female">Female</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="text-xs text-gray-500">Activity</label>
                                                                <select
                                                                    value={data.activity_level || 'sedentary'}
                                                                    onChange={e => setData('activity_level', e.target.value)}
                                                                    className="w-full text-sm h-8 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md py-0"
                                                                >
                                                                    <option value="sedentary">Sedentary</option>
                                                                    <option value="light">Lightly Active</option>
                                                                    <option value="moderate">Moderately Active</option>
                                                                    <option value="active">Active</option>
                                                                    <option value="very_active">Very Active</option>
                                                                </select>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="text-xs text-gray-500">Goal</label>
                                                                <select
                                                                    value={data.health_goal || 'maintenance'}
                                                                    onChange={e => setData('health_goal', e.target.value)}
                                                                    className="w-full text-sm h-8 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md py-0"
                                                                >
                                                                    <option value="loss">Weight Loss</option>
                                                                    <option value="maintenance">Maintenance</option>
                                                                    <option value="gain">Muscle Gain</option>
                                                                    <option value="growth">Growth (Child)</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-2 pt-2">
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="text-gray-500 text-sm px-2"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => saveEdit(member.id)}
                                                                className="bg-emerald-500 text-white rounded px-3 py-1 text-sm font-medium hover:bg-emerald-600"
                                                            >
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-300">
                                                                {member.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-900 dark:text-gray-100 text-sm font-medium">{member.name}</div>
                                                                <div className="text-xs text-gray-500">{member.daily_calorie_goal} kcal/day</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => startEdit(member)}
                                                                className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            {member.name !== 'You' && (
                                                                <button
                                                                    onClick={() => deleteMember(member.id)}
                                                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
