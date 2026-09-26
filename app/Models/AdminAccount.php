<?php
// app/Models/AdminAccount.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class AdminAccount extends Authenticatable
{
    protected $table = 'admin_accounts';
    protected $fillable = ['username', 'email', 'password', 'role_id'];
    protected $hidden = ['password'];

    public function role()
    {
        return $this->belongsTo(AdminRole::class, 'role_id');
    }

    /**
     * true si la cuenta tiene un rol con acceso total al panel.
     */
    public function isSuper(): bool
    {
        return (bool) optional($this->role)->is_super;
    }

    /**
     * true si la cuenta puede acceder a un modulo del panel (delega en el rol).
     * Sin rol asignado = sin acceso.
     */
    public function canAccess(string $module): bool
    {
        return $this->role ? $this->role->canAccess($module) : false;
    }
}
