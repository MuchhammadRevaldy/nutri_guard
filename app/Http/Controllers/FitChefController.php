<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class FitChefController extends Controller
{
    public function index()
    {
        return Inertia::render('FitChef');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'ingredients' => 'required|array',
            'ingredients.*' => 'string'
        ]);

        $ingredients = implode(', ', $request->input('ingredients'));
        $apiKey = 'AIzaSyBhjNtuz0GkGN7Ssr5fFnmjDDtd3pls7KY'; // In production, move to .env

        $prompt = "You are a professional nutritionist and chef. Suggest 3 distinct, healthy recipes using these ingredients (and basic pantry staples): $ingredients. 
        Return the result ONLY as a raw JSON array (no markdown code blocks) where each object has these exact keys:
        - title (string)
        - calories (integer, approximate)
        - time (string, e.g. '30 mins')
        - ingredients (array of strings, full list)
        - steps (array of strings, cooking instructions)
        
        Make sure the recipes are suitable for a family.";

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]);

            if ($response->failed()) {
                \Illuminate\Support\Facades\Log::error('Gemini API Error', $response->json());
                return $this->getMockRecipes($ingredients);
            }

            $rawText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? '[]';

            // Clean Markdown code blocks if API sends them
            $rawText = str_replace(['```json', '```'], '', $rawText);

            $recipes = json_decode($rawText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'AI generation format error.', 'raw' => $rawText], 500);
            }

            return response()->json([
                'recipes' => $recipes
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('FitChef Exception', ['msg' => $e->getMessage()]);
            return $this->getMockRecipes($ingredients);
        }
    }
    private function getMockRecipes($ingredients)
    {
        // Deterministic mock based on input to simulate AI
        return response()->json([
            'recipes' => [
                [
                    'title' => 'Healthy Stir-Fry (Demo Mode)',
                    'calories' => 450,
                    'time' => '25 mins',
                    'ingredients' => explode(', ', $ingredients . ', Garlic, Soy Sauce, Olive Oil'),
                    'steps' => [
                        'Heat olive oil in a pan over medium heat.',
                        'Sauté garlic until fragrant.',
                        'Add ' . $ingredients . ' and stir-fry for 5-7 minutes.',
                        'Season with soy sauce and serve warm.'
                    ]
                ],
                [
                    'title' => 'Fresh Salad Bowl (Demo Mode)',
                    'calories' => 320,
                    'time' => '10 mins',
                    'ingredients' => explode(', ', $ingredients . ', Lettuce, Lemon Dressing'),
                    'steps' => [
                        'Wash and chop all vegetables.',
                        'Combine ' . $ingredients . ' in a large bowl.',
                        'Toss with lemon dressing.',
                        'Serve chilled.'
                    ]
                ],
                [
                    'title' => 'Roasted Delight (Demo Mode)',
                    'calories' => 400,
                    'time' => '40 mins',
                    'ingredients' => explode(', ', $ingredients . ', Herbs, Olive Oil'),
                    'steps' => [
                        'Preheat oven to 200°C.',
                        'Toss ' . $ingredients . ' with olive oil and herbs.',
                        'Spread on a baking sheet.',
                        'Roast for 30 minutes until golden.'
                    ]
                ]
            ]
        ]);
    }
}
