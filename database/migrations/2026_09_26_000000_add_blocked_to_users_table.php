<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // Bloqueo de usuarios por el admin. Cambio ADITIVO y no destructivo: solo
    // agrega columnas nullable. Ninguna fila existente cambia (blocked_at = NULL
    // = usuario activo). El down() revierte quitando las columnas (rollback).
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'blocked_at')) {
                $table->timestamp('blocked_at')->nullable();
            }
            if (!Schema::hasColumn('users', 'blocked_reason')) {
                $table->string('blocked_reason')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'blocked_reason')) {
                $table->dropColumn('blocked_reason');
            }
            if (Schema::hasColumn('users', 'blocked_at')) {
                $table->dropColumn('blocked_at');
            }
        });
    }
};
