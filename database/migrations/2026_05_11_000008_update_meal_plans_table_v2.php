<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meal_plans', function (Blueprint $table) {
            // Link opsional ke bank resep — NULL jika rencana diisi manual
            $table->foreignId('recipe_id')->nullable()->after('family_member_id')
                ->constrained('recipes')->onDelete('set null');

            // Tracking apakah rencana sudah benar-benar dijalankan
            $table->boolean('is_completed')->default(false)->after('notes');
            $table->timestamp('completed_at')->nullable()->after('is_completed');

            // Index untuk query rencana makan minggu ini
            $table->index(['family_member_id', 'planned_date'], 'idx_mp_member_date');
        });
    }

    public function down(): void
    {
        Schema::table('meal_plans', function (Blueprint $table) {
            $table->dropIndex('idx_mp_member_date');
            $table->dropColumn(['is_completed', 'completed_at']);
            $table->dropConstrainedForeignId('recipe_id');
        });
    }
};
