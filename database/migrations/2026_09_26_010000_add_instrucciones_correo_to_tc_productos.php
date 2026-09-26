<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tc_productos', function (Blueprint $table) {
            $table->text('instrucciones_correo')->nullable()->after('descripcion');
        });
    }

    public function down(): void
    {
        Schema::table('tc_productos', function (Blueprint $table) {
            $table->dropColumn('instrucciones_correo');
        });
    }
};
