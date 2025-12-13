<?php

$dbPath = __DIR__ . '/database/database.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $sql = "CREATE TABLE IF NOT EXISTS growth_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        family_member_id INTEGER NOT NULL, 
        height REAL, 
        weight REAL, 
        recorded_at DATE, 
        created_at DATETIME, 
        updated_at DATETIME
    )";
    $pdo->exec($sql);
    echo "Table created successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
