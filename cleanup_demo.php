<?php

use App\Models\User;
use App\Models\FamilyMember;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Cleaning up demo family members...\n";

for ($i = 1; $i <= 5; $i++) {
    $email = "demo$i@example.com";
    $user = User::where('email', $email)->first();

    if ($user) {
        echo "Found User: $email (ID: {$user->id})\n";
        // Delete all family members owned by this user
        $count = FamilyMember::where('user_id', $user->id)->delete();
        echo "Deleted $count members.\n";
    }
}

echo "Cleanup complete.\n";
