<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('food_logs', function (Blueprint $table) {
            // Hapus image_path — foto dihapus setelah diproses NutriScan, tidak perlu disimpan
            $table->dropColumn('image_path');

            // Asal data: diketik manual, dari NutriScan AI, atau dari rencana makan
            $table->enum('source', ['manual', 'nutriscan', 'meal_plan'])->default('manual')->after('name');

            // Index untuk query performa
            $table->index(['family_member_id', 'eaten_at'], 'idx_fl_member_date');
            $table->index('source', 'idx_fl_source');
        });
    }

    public function down(): void
    {
        Schema::table('food_logs', function (Blueprint $table) {
            $table->dropIndex('idx_fl_member_date');
            $table->dropIndex('idx_fl_source');
            $table->dropColumn('source');
            $table->string('image_path')->nullable();
        });
    }
};
