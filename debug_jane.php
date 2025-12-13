<?php
$member = \App\Models\FamilyMember::where('name', 'jane')->first();
if ($member) {
    echo "ID: " . $member->id . "\n";
    echo "Name: " . $member->name . "\n";
    echo "Birth: " . ($member->birth_date ? $member->birth_date->format('Y-m-d') : 'NULL') . "\n";
    echo "Weight: " . ($member->weight ?? 'NULL') . "\n";
    echo "Height: " . ($member->height ?? 'NULL') . "\n";
    echo "Gender: " . ($member->gender ?? 'NULL') . "\n";
} else {
    echo "Member not found\n";
}
