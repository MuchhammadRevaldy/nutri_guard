<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // scan_quotas dibuat per-hari secara natural, tidak perlu reset.
        // Hapus record lama (> 30 hari) agar tabel tidak membesar.
        $schedule->call(function () {
            \App\Models\ScanQuota::where('scan_date', '<', now()->subDays(30)->toDateString())->delete();
        })->dailyAt('00:00')->name('cleanup-old-scan-quotas');
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
