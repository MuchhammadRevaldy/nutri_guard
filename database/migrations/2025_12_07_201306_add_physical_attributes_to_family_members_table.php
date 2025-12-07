<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('family_members', function (Blueprint $table) {
            $table->enum('gender', ['male', 'female'])->nullable()->after('role');
            $table->date('birth_date')->nullable()->after('gender');
            $table->decimal('weight', 5, 2)->nullable()->after('birth_date'); // kg
            $table->decimal('height', 5, 2)->nullable()->after('weight'); // cm
            $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'active', 'very_active'])->default('sedentary')->after('height');
            $table->enum('health_goal', ['loss', 'maintenance', 'gain', 'growth'])->default('maintenance')->after('activity_level');
            // 'growth' is specifically for children
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('family_members', function (Blueprint $table) {
            $table->dropColumn(['gender', 'birth_date', 'weight', 'height', 'activity_level', 'health_goal']);
        });
    }
};
