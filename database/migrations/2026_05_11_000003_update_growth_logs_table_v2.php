<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('growth_logs', function (Blueprint $table) {
            // BMI disimpan langsung saat insert agar tidak perlu hitung ulang
            $table->decimal('bmi', 4, 2)->nullable()->after('weight');

            // Catatan pengukuran (kondisi saat diukur, catatan dokter, dll)
            $table->text('notes')->nullable()->after('recorded_at');
        });
    }

    public function down(): void
    {
        Schema::table('growth_logs', function (Blueprint $table) {
            $table->dropColumn(['bmi', 'notes']);
        });
    }
};
