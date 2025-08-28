<?php

// database/migrations/xxxx_xx_xx_create_exchange_rates_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->decimal('value', 10, 4);
            $table->string('source')->nullable(); // 'panel' o 'telegram'
            $table->unsignedBigInteger('set_by_user_id')->nullable();
            $table->unsignedBigInteger('set_by_telegram_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};

