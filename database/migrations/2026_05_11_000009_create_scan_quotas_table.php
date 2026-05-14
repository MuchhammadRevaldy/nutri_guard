<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scan_quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Satu baris per user per hari
            $table->date('scan_date');

            // Jumlah scan terpakai hari itu (maks 20)
            $table->unsignedSmallInteger('scan_count')->default(0);

            $table->timestamps();

            $table->unique(['user_id', 'scan_date'], 'uq_sq_user_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scan_quotas');
    }
};
