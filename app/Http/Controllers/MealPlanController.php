<?php

namespace App\Http\Controllers;

use App\Models\MealPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MealPlanController extends Controller
{
    public function index(Request $request)
    {
        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->where('name', 'You')->first()
            ?? $user->familyMembers->first();

        $weekStart = $request->query('week_start')
            ? \Carbon\Carbon::parse($request->query('week_start'))->startOfWeek(\Carbon\Carbon::MONDAY)
            : now()->startOfWeek(\Carbon\Carbon::MONDAY);

        $weekEnd = $weekStart->copy()->endOfWeek(\Carbon\Carbon::SUNDAY);

        $plans = MealPlan::where('family_member_id', $myself?->id)
            ->whereBetween('planned_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get()
            ->groupBy(fn($p) => $p->planned_date->toDateString());

        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date    = $weekStart->copy()->addDays($i);
            $dateStr = $date->toDateString();
            $days[]  = [
                'date'       => $dateStr,
                'label'      => $date->format('D'),
                'full_label' => $date->format('D, M j'),
                'meals'      => $plans->get($dateStr, collect())->values(),
            ];
        }

        return Inertia::render('MealPlanner', [
            'days'           => $days,
            'weekStart'      => $weekStart->toDateString(),
            'weekEnd'        => $weekEnd->toDateString(),
            'calorieGoal'    => $myself?->daily_calorie_goal ?? 2000,
            'familyMember'   => $myself,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'planned_date' => 'required|date',
            'meal_type'    => 'required|in:breakfast,lunch,dinner,snack',
            'name'         => 'required|string|max:255',
            'calories'     => 'nullable|integer|min:0',
            'protein'      => 'nullable|numeric|min:0',
            'carbs'        => 'nullable|numeric|min:0',
            'fat'          => 'nullable|numeric|min:0',
            'notes'        => 'nullable|string|max:500',
        ]);

        $user   = auth()->user();
        $myself = $user->familyMembers->where('linked_user_id', $user->id)->first()
            ?? $user->familyMembers->first();

        MealPlan::create(array_merge($validated, [
            'family_member_id' => $myself->id,
        ]));

        return back()->with('success', 'Meal plan berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $plan = MealPlan::findOrFail($id);
        $user = auth()->user();

        $memberIds = $user->familyMembers->pluck('id');
        if (!$memberIds->contains($plan->family_member_id)) {
            abort(403);
        }

        $plan->delete();

        return back()->with('success', 'Meal plan berhasil dihapus.');
    }
}
