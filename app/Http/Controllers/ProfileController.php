<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Robustly find the family member representing the user
        $familyMember = $user->familyMembers()->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers()->where('name', 'You')->first();

        // Self-Healing: If still no profile, create one default
        if (!$familyMember) {
            $familyMember = $user->familyMembers()->create([
                'name' => $user->name, // Default to user's name e.g. "Jane"
                'role' => 'parent',
                'linked_user_id' => $user->id,
                'daily_calorie_goal' => 2000,
                'gender' => 'male', // Default valid enum to prevent UI crash
                'activity_level' => 'sedentary',
                'health_goal' => 'maintenance',
                'birth_date' => '2000-01-01', // Default date
                'weight' => 60,
                'height' => 170
            ]);
        }

        // If we found 'You' but it wasn't linked (legacy), link it now
        if ($familyMember && !$familyMember->linked_user_id) {
            $familyMember->linked_user_id = $user->id;
            $familyMember->save();
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'familyMember' => $familyMember,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $request->user()->forceFill([
                'avatar' => $path,
            ])->save();
        }

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
