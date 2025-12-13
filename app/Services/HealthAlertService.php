<?php

namespace App\Services;

use App\Models\FamilyMember;
use App\Models\FoodLog;
use App\Models\GrowthLog;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class HealthAlertService
{
    /**
     * Generate health alerts for a family member based on last 7 days of logs and growth history.
     *
     * @param FamilyMember $member
     * @return array
     */
    public function generateHealthAlerts(FamilyMember $member): array
    {
        $alerts = [];
        $today = Carbon::today();
        $sevenDaysAgo = $today->copy()->subDays(6);

        // 1. Fetch Data
        $weeklyLogs = FoodLog::where('family_member_id', $member->id)
            ->whereDate('eaten_at', '>=', $sevenDaysAgo)
            ->get();

        $currentGrowth = GrowthLog::where('family_member_id', $member->id)
            ->whereDate('recorded_at', $today)
            ->orderBy('recorded_at', 'desc')
            ->first();

        // Fallback to member's current stats if no log today, but for alerts we prefer logs
        if (!$currentGrowth) {
            $currentHeight = $member->height;
            $currentWeight = $member->weight;
        } else {
            $currentHeight = $currentGrowth->height;
            $currentWeight = $currentGrowth->weight;
        }

        $lastMonthGrowth = GrowthLog::where('family_member_id', $member->id)
            ->whereDate('recorded_at', '<=', $today->copy()->subDays(25))
            ->orderBy('recorded_at', 'desc')
            ->first();

        // 1. Critical Stunting Risk (Trigger: Animal Protein < 5x/week)
        $animalProteinCount = $weeklyLogs->filter(function ($log) {
            return is_array($log->tags) && in_array('Animal Protein', $log->tags);
        })->count();

        if ($animalProteinCount < 5) {
            $alerts[] = [
                'type' => 'critical',
                'title' => 'High Stunting Risk',
                'message' => 'Animal protein intake is severely low (< 1/day). Immediate diet correction needed.',
                'icon' => 'alert-circle',
            ];
        }

        // 2. Low Iron Risk (Trigger: High Iron < 2x/week)
        $ironCount = $weeklyLogs->filter(function ($log) {
            return is_array($log->tags) && (in_array('High Iron', $log->tags) || in_array('Iron Boost', $log->tags));
        })->count();

        if ($ironCount < 2) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Risk of Iron Deficiency',
                'message' => 'Iron intake is low. Suggest adding Chicken Liver, Spinach, or Red Meat.',
                'icon' => 'alert-triangle',
            ];
        }

        // 3. Growth Analysis (Compare with last month)
        if ($lastMonthGrowth) {
            $heightDiff = $currentHeight - $lastMonthGrowth->height;
            if ($heightDiff <= 0 && $member->age_category !== 'Mature') {
                $alerts[] = [
                    'type' => 'warning',
                    'title' => 'No Height Growth Detected',
                    'message' => 'Height has been stagnant since last month (' . $lastMonthGrowth->recorded_at->format('M d') . '). Monitor protein.',
                    'icon' => 'trending-flat',
                ];
            }

            // Weight Loss check
            $weightDiff = $currentWeight - $lastMonthGrowth->weight;
            if ($weightDiff < 0) {
                $alerts[] = [
                    'type' => 'critical',
                    'title' => 'Weight Loss Detected',
                    'message' => "Weight dropped by " . abs($weightDiff) . "kg compared to last month. Ensure calorie surplus.",
                    'icon' => 'trending-down',
                ];
            }
        }

        return $alerts;
    }
}
