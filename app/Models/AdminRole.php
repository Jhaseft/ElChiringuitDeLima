<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminRole extends Model
{
    protected $table = 'admin_roles';

    protected $fillable = ['name', 'slug', 'permissions', 'is_super'];

    protected $casts = [
        'permissions' => 'array',
        'is_super'    => 'boolean',
    ];

    /**
     * Fuente unica de verdad de las pestanas asignables del panel (clave => label).
     * El sidebar, el middleware y el editor de roles se basan en este mapa.
     * "administradores" NO esta aqui a proposito: es exclusivo de roles is_super.
     */
    public const MODULES = [
        'dashboard'      => 'Inicio',
        'tipo-cambio'    => 'Tipo de Cambio',
        'notificaciones' => 'Notificaciones',
        'transferencias' => 'Transferencias',
        'efectivo'       => 'Efectivo',
        'qr'             => 'QR',
        'metodos'        => 'Metodos de Pago',
        'usuarios'       => 'Usuarios',
        'reportes'       => 'Reportes',
        'configuracion'  => 'Configuracion',
        'productos-tc'   => 'Productos TC',
        'canjes-tc'      => 'Canjes TC',
        'banners'        => 'Banners',
    ];

    /**
     * URL del panel para cada modulo. Se usa para redirigir tras el login a la
     * primera pestana permitida del rol (mismo orden que MODULES).
     */
    public const MODULE_ROUTES = [
        'dashboard'      => '/admin/dashboard',
        'tipo-cambio'    => '/admin/dashboard/tipo-cambio',
        'notificaciones' => '/admin/dashboard/notificaciones',
        'transferencias' => '/admin/dashboard/transferencias',
        'efectivo'       => '/admin/dashboard/efectivo',
        'qr'             => '/admin/dashboard/qr',
        'metodos'        => '/admin/dashboard/metodos',
        'usuarios'       => '/admin/dashboard/usuarios',
        'reportes'       => '/admin/dashboard/reportes',
        'configuracion'  => '/admin/dashboard/configuracion',
        'productos-tc'   => '/admin/dashboard/productos-tc',
        'canjes-tc'      => '/admin/dashboard/canjes-tc',
        'banners'        => '/admin/dashboard/banners',
    ];

    public function accounts()
    {
        return $this->hasMany(AdminAccount::class, 'role_id');
    }

    /**
     * URL de aterrizaje tras el login: la primera pestana (en orden de MODULES)
     * a la que el admin tiene acceso. null si no tiene ninguna asignada.
     */
    public static function landingPathFor(?AdminAccount $admin): ?string
    {
        if (!$admin || !$admin->role) {
            return null;
        }
        foreach (self::MODULE_ROUTES as $module => $path) {
            if ($admin->canAccess($module)) {
                return $path;
            }
        }
        return null;
    }

    /**
     * true si el rol puede acceder a un modulo del panel. Los roles is_super
     * pueden todo (incluida la gestion de administradores). "administradores"
     * es solo para super. El resto se valida contra permissions.
     */
    public function canAccess(string $module): bool
    {
        if ($this->is_super) {
            return true;
        }
        if ($module === 'administradores') {
            return false;
        }
        return in_array($module, $this->permissions ?? [], true);
    }
}
