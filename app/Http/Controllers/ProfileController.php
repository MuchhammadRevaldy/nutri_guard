<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $familyMember = $user->familyMembers()->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers()->where('name', 'You')->first();

        if (!$familyMember) {
            $familyMember = $user->familyMembers()->create([
                'name'           => $user->name,
                'role'           => 'parent',
                'linked_user_id' => $user->id,
                'gender'         => 'male',
                'activity_level' => 'sedentary',
                'health_goal'    => 'maintenance',
                'birth_date'     => '2000-01-01',
            ]);
        }

        if ($familyMember && !$familyMember->linked_user_id) {
            $familyMember->linked_user_id = $user->id;
            $familyMember->save();
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
            'familyMember'    => $familyMember,
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Upload atau simpan URL foto profil via API.
     * Menerima: multipart file (avatar) ATAU JSON body (api_url, api_provider).
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        // ── Upload file lokal ──────────────────────────────────────────────
        if ($request->hasFile('avatar')) {
            $request->validate([
                'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:3072',
            ]);

            // Hapus file lama jika ada
            if ($user->avatar_source === 'local' && $user->avatar_url) {
                $oldPath = ltrim(str_replace('/storage', '', $user->avatar_url), '/');
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('avatars', 'public');

            $user->forceFill([
                'avatar_url'      => Storage::url($path),
                'avatar_source'   => 'local',
                'avatar_provider' => null,
            ])->save();

            return response()->json([
                'avatar_url' => $user->avatar_url,
                'message'    => 'Foto profil berhasil diperbarui.',
            ]);
        }

        // ── URL dari API eksternal ─────────────────────────────────────────
        if ($request->filled('api_url')) {
            $request->validate([
                'api_url'      => 'required|url|max:2048',
                'api_provider' => 'nullable|string|max:100',
            ]);

            $user->forceFill([
                'avatar_url'      => $request->api_url,
                'avatar_source'   => 'url',
                'avatar_provider' => $request->api_provider,
            ])->save();

            return response()->json([
                'avatar_url' => $user->avatar_url,
                'message'    => 'Foto profil berhasil diperbarui.',
            ]);
        }

        return response()->json(['message' => 'Tidak ada input yang valid.'], 422);
    }

    /**
     * Hapus foto profil via API.
     */
    public function removeAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar_source === 'local' && $user->avatar_url) {
            $oldPath = ltrim(str_replace('/storage', '', $user->avatar_url), '/');
            Storage::disk('public')->delete($oldPath);
        }

        $user->forceFill([
            'avatar_url'      => null,
            'avatar_source'   => null,
            'avatar_provider' => null,
        ])->save();

        return response()->json(['message' => 'Foto profil berhasil dihapus.']);
    }

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
