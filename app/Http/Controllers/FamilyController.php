<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FamilyInvitation;
use App\Models\FamilyMember;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class FamilyController extends Controller
{
    // Send Invitation
    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = auth()->user();

        // Check if user already invited this email
        $existing = FamilyInvitation::where('sender_id', $user->id)
            ->where('recipient_email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('error', 'Invitation already sent to this email.');
        }

        $token = Str::random(32);

        $invitation = FamilyInvitation::create([
            'sender_id' => $user->id,
            'recipient_email' => $request->email,
            'token' => $token,
            'status' => 'pending'
        ]);

        // Send Email (Log for now)
        $inviteUrl = route('family.accept', ['token' => $token]);

        Log::info("Invitation sent to {$request->email}. Link: {$inviteUrl}");

        // In a real app we would use Mail::to($request->email)->send(new InviteMail($inviteUrl));

        return back()->with('success', 'Invitation sent! Check the logs for the link (since we are using log driver).');
    }

    // Accept Invitation
    public function accept($token)
    {
        $invitation = FamilyInvitation::where('token', $token)->where('status', 'pending')->first();

        if (!$invitation) {
            return redirect('/')->with('error', 'Invalid or expired invitation.');
        }

        // If user is not logged in, redirect to login with intended URL? 
        // For simplicity, assume they need to login/register first.
        // If logged in:
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login')->with('status', 'Please login to accept the invitation.');
        }

        // Check if email matches (optional security step, skipped for flexibility now)

        // Link logic:
        // 1. Create a "Family Member" entry in the SENDER's family list representing this NEW user.
        // OR 2. Just add the User to the group.
        // Based on "FamilyMember" table structure, it belongs to a "User" (Head of family).
        // So we create a FamilyMember row for the SENDER, linked to the RECIPIENT.

        FamilyMember::create([
            'user_id' => $invitation->sender_id, // Owner is the sender
            'linked_user_id' => $user->id, // Linked to the person accepting
            'name' => $user->name, // Use their profile name
            'role' => 'child', // Default role, can be changed
            'daily_calorie_goal' => 2000
        ]);

        $invitation->update(['status' => 'accepted']);

        return redirect()->route('dashboard')->with('success', 'You have joined the family!');
    }

    // Update Member (Rename)
    public function update(Request $request, $id)
    {
        $member = FamilyMember::findOrFail($id);

        if ($member->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'activity_level' => 'nullable|in:sedentary,light,moderate,active,very_active',
            'health_goal' => 'nullable|in:loss,maintenance,gain,growth',
        ]);

        $member->fill($request->all());
        $member->recalculateCalories();
        $member->save();

        return back()->with('success', 'Member details updated and calories recalculated.');
    }

    // Delete Member
    public function destroy($id)
    {
        $member = FamilyMember::findOrFail($id);

        if ($member->user_id !== auth()->id()) {
            abort(403);
        }

        // Prevent deleting "You" (the user themselves) if that's critical logic
        if ($member->name === 'You' || $member->linked_user_id === auth()->id()) {
            // For now allow, but usually we restrict main profile deletion
            // return back()->with('error', 'Cannot delete main profile.');
        }

        $member->delete();

        return back()->with('success', 'Member removed.');
    }
}
