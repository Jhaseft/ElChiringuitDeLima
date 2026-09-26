<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // Roles dinámicos del panel admin. Cada rol define a qué pestañas del panel
    // accede (permissions = JSON con las claves de módulo). is_super = acceso
    // total (ve todo el panel y gestiona roles/admins). Cambio ADITIVO: crea una
    // tabla nueva y siembra un rol "Super Administrador" para no dejar a los
    // admins existentes sin acceso (la migración que agrega role_id los asigna).
    public function up(): void
    {
        if (!Schema::hasTable('admin_roles')) {
            Schema::create('admin_roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->json('permissions')->nullable();
                $table->boolean('is_super')->default(false);
                $table->timestamps();
            });
        }

        $exists = DB::table('admin_roles')->where('slug', 'super-admin')->exists();
        if (!$exists) {
            DB::table('admin_roles')->insert([
                'name'        => 'Super Administrador',
                'slug'        => 'super-admin',
                'permissions' => json_encode([]),
                'is_super'    => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_roles');
    }
};
