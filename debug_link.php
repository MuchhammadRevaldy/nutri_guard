<?php
$janeUser = \App\Models\User::where('email', 'demo2@example.com')->first();
$janeMember = \App\Models\FamilyMember::where('name', 'jane')->first();

echo "Jane User ID: " . ($janeUser ? $janeUser->id : 'NOT FOUND') . "\n";
echo "Jane Member ID: " . ($janeMember ? $janeMember->id : 'NOT FOUND') . "\n";
echo "Linked User ID: " . ($janeMember ? $janeMember->linked_user_id : 'NULL') . "\n";

if ($janeUser && $janeMember && $janeMember->linked_user_id != $janeUser->id) {
    echo "MISMATCH DETECTED. Fixing...\n";
    $janeMember->linked_user_id = $janeUser->id;
    $janeMember->save();
    echo "Fixed.\n";
} else {
    echo "Link OK (or user missing).\n";
}
