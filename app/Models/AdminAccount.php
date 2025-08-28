<?php
// app/Models/AdminAccount.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class AdminAccount extends Authenticatable
{
    protected $table = 'admin_accounts';
    protected $fillable = ['username', 'email', 'password'];
    protected $hidden = ['password'];
}
