<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TryDeployController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $request->validate([
                'message' => 'required|string',
                'history' => 'array',
            ]);

            // Flexible API Key logic
            $apiKey = env('VITE_BYTEZ_API_KEY') ?? env('VITE_OPENROUTER_API_KEY') ?? env('VITE_ZENMUX_API_KEY') ?? env('VITE_GEMINI_API_KEY');

            // Debug: Check if key exists (without revealing it)
            if (!$apiKey) {
                return response()->json(['error' => 'API Key is NULL. Check .env and clear config cache.'], 500);
            }

            // Determine Provider
            if (env('VITE_BYTEZ_API_KEY') && $apiKey === env('VITE_BYTEZ_API_KEY')) {
                // Bytez Configuration
                $url = 'https://api.bytez.com/v1/chat/completions';
                // Default to a safe model. User provided link mentions Langchain integration which implies standard naming.
                $model = 'gemini-1.5-flash';
            } elseif (str_starts_with($apiKey, 'sk-or-')) {
                // OpenRouter
                $url = 'https://openrouter.ai/api/v1/chat/completions';
                $model = 'google/gemini-2.0-flash-thinking-exp:free';
            } else {
                // Zenmux / Fallback
                $url = env('VITE_ZENMUX_BASE_URL', 'https://zenmux.ai/api/v1/chat/completions');
                $model = 'gemini-1.5-flash';
            }

            // Allow override via Env
            if (env('VITE_AI_BASE_URL')) {
                $url = env('VITE_AI_BASE_URL');
            }

            // Prepare messages
            $messages = [];
            foreach ($request->input('history', []) as $msg) {
                $role = ($msg['role'] === 'model') ? 'assistant' : $msg['role'];
                $messages[] = ['role' => $role, 'content' => $msg['content']];
            }
            $messages[] = ['role' => 'user', 'content' => $request->input('message')];

            // Call External API
            $response = Http::withToken($apiKey)->withHeaders([
                'HTTP-Referer' => env('APP_URL', 'http://localhost'), // OpenRouter requirement
                'X-Title' => 'NutriGuard', // OpenRouter requirement
            ])->post($url, [
                        'model' => $model,
                        'messages' => $messages,
                        'stream' => false,
                    ]);

            if ($response->failed()) {
                return response()->json([
                    'error' => 'External API Error: ' . $response->status(),
                    'details' => $response->body()
                ], $response->status());
            }

            return $response->json();

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Exception: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
