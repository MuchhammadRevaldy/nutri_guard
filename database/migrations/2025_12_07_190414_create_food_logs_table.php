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
        Schema::create('food_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('family_member_id')->constrained('family_members')->onDelete('cascade');
            $table->string('name');
            $table->integer('calories');
            $table->float('protein')->default(0);
            $table->float('carbs')->default(0);
            $table->float('fat')->default(0);
            $table->string('image_path')->nullable();
            $table->timestamp('eaten_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food_logs');
    }
};
