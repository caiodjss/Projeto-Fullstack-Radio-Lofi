<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tracks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('station_id')->constrained()->onDelete('cascade');
        $table->foreignId('artist_id')->constrained()->onDelete('cascade');
        $table->string('title');
        $table->string('audio_url');
        $table->integer('duration_seconds')->default(0);
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracks');
    }
};
