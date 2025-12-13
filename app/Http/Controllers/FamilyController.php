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
    // Show Member Profile
    public function show($id)
    {
        $member = FamilyMember::findOrFail($id);

        if ($member->user_id !== auth()->id() && $member->linked_user_id !== auth()->id()) {
            abort(403);
        }

        // Health Alerts Logic
        $healthService = new \App\Services\HealthAlertService();
        $alerts = $healthService->generateHealthAlerts($member);

        // Weekly Logs for Chart
        $weeklyLogs = $member->foodLogs()
            ->whereDate('eaten_at', '>=', now()->subDays(6))
            ->orderBy('eaten_at', 'asc')
            ->get()
            ->groupBy(function ($date) {
                return \Carbon\Carbon::parse($date->eaten_at)->format('D');
            });

        // Growth History
        $growthHistory = \App\Models\GrowthLog::where('family_member_id', $member->id)
            ->orderBy('recorded_at', 'desc')
            ->take(6)
            ->get();

        return \Inertia\Inertia::render('MemberProfile', [
            'member' => $member,
            'alerts' => $alerts,
            'weeklyLogs' => $weeklyLogs,
            'growthHistory' => $growthHistory
        ]);
    }

    // List Invitations (Notification Center)
    public function invitations()
    {
        $user = auth()->user();

        // 1. Pending Invitations
        $invitations = FamilyInvitation::with('sender')
            ->where('recipient_email', $user->email)
            ->where('status', 'pending')
            ->get();

        // 2. Unread Chat Messages (Grouped by Sender)
        $unreadChats = \App\Models\Message::where('recipient_id', $user->id)
            ->where('sender_id', '!=', $user->id) // Prevent self-messages from appearing
            ->where('is_read', false)
            ->with('sender')
            ->get()
            ->groupBy('sender_id')
            ->map(function ($messages) {
                return [
                    'sender' => $messages->first()->sender,
                    'count' => $messages->count(),
                    'latest_message' => $messages->last()
                ];
            })->values();

        return \Inertia\Inertia::render('WelcomeInvite', [
            'invitations' => $invitations,
            'unreadChats' => $unreadChats
        ]);
    }

    // Send Invitation
    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        // 1. Check if User Exists (Requirement: Email must be in DB)
        $recipient = \App\Models\User::where('email', $request->email)->first();

        if (!$recipient) {
            return back()->withErrors(['email' => 'Email not found in our database.']);
        }

        $user = auth()->user();

        // 2. Prevent self-invite
        if ($recipient->id === $user->id) {
            return back()->withErrors(['email' => 'You cannot invite yourself.']);
        }

        // 3. Check if invitation already exists
        $existing = FamilyInvitation::where('sender_id', $user->id)
            ->where('recipient_email', $request->email)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('error', 'Invitation already sent to this email.');
        }

        $token = Str::random(32);

        FamilyInvitation::create([
            'sender_id' => $user->id,
            'recipient_email' => $request->email,
            'token' => $token,
            'status' => 'pending'
        ]);

        return back()->with('success', 'Invitation sent! The user will receive a notification.');
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

        // 1. Add Recipient to Sender's Family
        FamilyMember::create([
            'user_id' => $invitation->sender_id, // Owner: Sender
            'linked_user_id' => $user->id,       // Member: Recipient
            'name' => $user->name,
            'role' => 'member',
            'daily_calorie_goal' => 2000
        ]);

        // 2. Add Sender to Recipient's Family (Bidirectional)
        $sender = \App\Models\User::find($invitation->sender_id);
        if ($sender) {
            FamilyMember::create([
                'user_id' => $user->id,              // Owner: Recipient
                'linked_user_id' => $sender->id,     // Member: Sender
                'name' => $sender->name,
                'role' => 'member',
                'daily_calorie_goal' => 2000
            ]);
        }

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
