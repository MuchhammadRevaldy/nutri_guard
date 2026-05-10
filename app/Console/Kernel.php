<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Reset scan count for all users every midnight (Business Rule: daily scan limit)
        $schedule->call(function () {
            \App\Models\User::query()->update([
                'scan_count_today' => 0,
                'scan_date'        => now()->toDateString(),
            ]);
        })->dailyAt('00:00')->name('reset-daily-scan-count');
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
