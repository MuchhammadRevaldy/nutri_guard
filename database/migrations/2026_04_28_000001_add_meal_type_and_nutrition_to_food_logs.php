<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('food_logs', function (Blueprint $table) {
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack'])
                ->default('lunch')
                ->after('eaten_at');
            $table->decimal('fiber', 6, 2)->nullable()->after('fat');
            $table->decimal('sodium', 8, 2)->nullable()->after('fiber');
            $table->decimal('sugar', 6, 2)->nullable()->after('sodium');
        });
    }

    public function down(): void
    {
        Schema::table('food_logs', function (Blueprint $table) {
            $table->dropColumn(['meal_type', 'fiber', 'sodium', 'sugar']);
        });
    }
};
