<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('radio_station_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamp('cycle_started_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('radio_station_states');
    }
};
