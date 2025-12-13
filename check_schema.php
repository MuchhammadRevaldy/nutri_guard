<?php

use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$hasTags = Schema::hasColumn('food_logs', 'tags');
$hasGrowthTable = Schema::hasTable('growth_logs');

echo "DB Connection: " . config('database.default') . "\n";
echo "DB Database: " . config('database.connections.' . config('database.default') . '.database') . "\n";
echo "Tags Column: " . ($hasTags ? 'YES' : 'NO') . "\n";
echo "Growth Table: " . ($hasGrowthTable ? 'YES' : 'NO') . "\n";
