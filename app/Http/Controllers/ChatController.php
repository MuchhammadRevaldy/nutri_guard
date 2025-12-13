<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Find users linked via FamilyMember
        $ownedMemberIds = $user->familyMembers()->whereNotNull('linked_user_id')->pluck('linked_user_id');
        $memberOfIds = \App\Models\FamilyMember::where('linked_user_id', $user->id)->pluck('user_id');

        $familyUserIds = $ownedMemberIds->merge($memberOfIds)->unique();

        // Exclude current user
        $familyUserIds = $familyUserIds->reject(function ($id) use ($user) {
            return $id === $user->id;
        });

        $contacts = User::whereIn('id', $familyUserIds)->get()->map(function ($contact) use ($user) {
            // Get last message
            $lastMessage = Message::where(function ($q) use ($user, $contact) {
                $q->where('sender_id', $user->id)->where('recipient_id', $contact->id);
            })->orWhere(function ($q) use ($user, $contact) {
                $q->where('sender_id', $contact->id)->where('recipient_id', $user->id);
            })->latest()->first();

            // Count unread from this contact
            $contact->unread_count = Message::where('sender_id', $contact->id)
                ->where('recipient_id', $user->id)
                ->where('is_read', false)
                ->count();

            $contact->last_message = $lastMessage;
            return $contact;
        });

        return Inertia::render('Chat/ChatIndex', [
            'contacts' => $contacts
        ]);
    }

    public function show($userId)
    {
        // Fetch conversation
        $authUserId = Auth::id();

        $messages = Message::where(function ($q) use ($authUserId, $userId) {
            $q->where('sender_id', $authUserId)->where('recipient_id', $userId);
        })->orWhere(function ($q) use ($authUserId, $userId) {
            $q->where('sender_id', $userId)->where('recipient_id', $authUserId);
        })->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'message' => $request->message,
        ]);

        return response()->json($message);
    }

    public function markAsRead($senderId)
    {
        Message::where('sender_id', $senderId)
            ->where('recipient_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['status' => 'success']);
    }
}
