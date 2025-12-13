<?php
$member = \App\Models\FamilyMember::where('name', 'jane')->first();
if ($member) {
    $member->update([
        'birth_date' => '2010-06-15',
        'weight' => 45.5,
        'height' => 152.0,
        'gender' => 'female',
        'health_goal' => 'growth',
        'activity_level' => 'active'
    ]);
    echo "Jane Updated Successfully.\n";
} else {
    echo "Jane not found.\n";
}
