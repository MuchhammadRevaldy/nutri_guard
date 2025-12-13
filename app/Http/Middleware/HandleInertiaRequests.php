<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'pendingInvitationsCount' => \App\Models\FamilyInvitation::where('recipient_email', $request->user()->email)
                        ->where('status', 'pending')
                        ->count(),
                    'unreadMessagesCount' => \App\Models\Message::where('recipient_id', $request->user()->id)
                        ->where('sender_id', '!=', $request->user()->id)
                        ->where('is_read', false)
                        ->count()
                ]) : null,
            ],
        ];
    }
}
