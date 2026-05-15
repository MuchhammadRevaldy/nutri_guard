<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('HubungiKami');
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|max:150',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:2000',
        ]);

        // Kirim email ke alamat internal (tidak ditampilkan di UI)
        Mail::send([], [], function ($mail) use ($validated) {
            $mail->to('revaldyaji@gmail.com')
                 ->replyTo($validated['email'], $validated['name'])
                 ->subject('[NutriGuard] ' . $validated['subject'])
                 ->html(
                     '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">'
                     . '<div style="background:#10b981;padding:20px 24px;border-radius:12px 12px 0 0">'
                     . '<h2 style="color:white;margin:0;font-size:20px">Pesan Baru dari NutriGuard</h2>'
                     . '</div>'
                     . '<div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none">'
                     . '<table style="width:100%;border-collapse:collapse">'
                     . '<tr><td style="padding:8px 0;color:#6b7280;width:100px">Nama</td><td style="padding:8px 0;font-weight:600">' . htmlspecialchars($validated['name']) . '</td></tr>'
                     . '<tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0">' . htmlspecialchars($validated['email']) . '</td></tr>'
                     . '<tr><td style="padding:8px 0;color:#6b7280">Subjek</td><td style="padding:8px 0;font-weight:600">' . htmlspecialchars($validated['subject']) . '</td></tr>'
                     . '</table>'
                     . '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">'
                     . '<p style="color:#374151;line-height:1.6;white-space:pre-line">' . htmlspecialchars($validated['message']) . '</p>'
                     . '</div>'
                     . '</div>'
                 );
        });

        return back()->with('success', 'Pesan berhasil terkirim! Kami akan menghubungi kamu segera.');
    }
}
