<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // Asocia cada cuenta admin a un rol (admin_roles). Cambio ADITIVO y no
    // destructivo: columna nullable. Para que ningun admin actual pierda acceso,
    // se les asigna el rol "Super Administrador" sembrado en la migracion previa.
    public function up(): void
    {
        Schema::table('admin_accounts', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_accounts', 'role_id')) {
                $table->unsignedBigInteger('role_id')->nullable()->after('password');
            }
        });

        $superId = DB::table('admin_roles')->where('slug', 'super-admin')->value('id');
        if ($superId) {
            DB::table('admin_accounts')->whereNull('role_id')->update(['role_id' => $superId]);
        }
    }

    public function down(): void
    {
        Schema::table('admin_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('admin_accounts', 'role_id')) {
                $table->dropColumn('role_id');
            }
        });
    }
};
