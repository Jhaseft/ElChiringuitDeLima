<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAccount;
use App\Models\AdminRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminAccountsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Administradores', [
            'admins' => AdminAccount::with('role:id,name,is_super')
                ->orderBy('id')
                ->get(['id', 'username', 'email', 'role_id']),
            'roles' => AdminRole::orderBy('name')
                ->get(['id', 'name', 'slug', 'permissions', 'is_super']),
            'modules' => AdminRole::MODULES,
        ]);
    }

    // ---------------- Cuentas admin ----------------

    public function storeAdmin(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:admin_accounts,username',
            'email'    => 'required|email|max:255|unique:admin_accounts,email',
            'password' => 'required|string|min:8',
            'role_id'  => 'required|exists:admin_roles,id',
        ]);

        $admin = AdminAccount::create([
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role_id'  => $request->role_id,
        ]);

        return response()->json(['success' => true, 'admin' => $admin->load('role:id,name,is_super')]);
    }

    public function updateAdmin(Request $request, int $id)
    {
        $admin = AdminAccount::findOrFail($id);

        $request->validate([
            'username' => ['required', 'string', 'max:255', Rule::unique('admin_accounts', 'username')->ignore($admin->id)],
            'email'    => ['required', 'email', 'max:255', Rule::unique('admin_accounts', 'email')->ignore($admin->id)],
            'password' => 'nullable|string|min:8',
            'role_id'  => 'required|exists:admin_roles,id',
        ]);

        // No permitir que el ultimo admin super se quede sin rol super.
        if ($admin->isSuper() && !$this->roleIsSuper($request->role_id) && $this->superAdminsCount() <= 1) {
            return response()->json(['message' => 'No puedes quitar el ultimo administrador con acceso total.'], 422);
        }

        $admin->username = $request->username;
        $admin->email    = $request->email;
        $admin->role_id  = $request->role_id;
        if ($request->filled('password')) {
            $admin->password = Hash::make($request->password);
        }
        $admin->save();

        return response()->json(['success' => true, 'admin' => $admin->load('role:id,name,is_super')]);
    }

    public function destroyAdmin(int $id)
    {
        $admin = AdminAccount::findOrFail($id);

        if ((int) Auth::guard('admin')->id() === $admin->id) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta.'], 422);
        }
        if ($admin->isSuper() && $this->superAdminsCount() <= 1) {
            return response()->json(['message' => 'No puedes eliminar el ultimo administrador con acceso total.'], 422);
        }

        $admin->delete();

        return response()->json(['success' => true]);
    }

    // ---------------- Roles ----------------

    public function storeRole(Request $request)
    {
        $data = $this->validateRole($request);

        $role = AdminRole::create([
            'name'        => $data['name'],
            'slug'        => $this->uniqueSlug($data['name']),
            'permissions' => $data['is_super'] ? [] : $data['permissions'],
            'is_super'    => $data['is_super'],
        ]);

        return response()->json(['success' => true, 'role' => $role]);
    }

    public function updateRole(Request $request, int $id)
    {
        $role = AdminRole::findOrFail($id);
        $data = $this->validateRole($request);

        // Evitar dejar el sistema sin ningun rol super en uso.
        if ($role->is_super && !$data['is_super'] && $this->superAdminsCount($role->id) <= 0) {
            return response()->json(['message' => 'Debe existir al menos un administrador con acceso total.'], 422);
        }

        $role->name        = $data['name'];
        $role->permissions = $data['is_super'] ? [] : $data['permissions'];
        $role->is_super    = $data['is_super'];
        $role->save();

        return response()->json(['success' => true, 'role' => $role]);
    }

    public function destroyRole(int $id)
    {
        $role = AdminRole::findOrFail($id);

        if ($role->accounts()->exists()) {
            return response()->json(['message' => 'No puedes eliminar un rol que tiene administradores asignados.'], 422);
        }

        $role->delete();

        return response()->json(['success' => true]);
    }

    // ---------------- Helpers ----------------

    private function validateRole(Request $request): array
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'is_super'      => 'boolean',
            'permissions'   => 'array',
            'permissions.*' => ['string', Rule::in(array_keys(AdminRole::MODULES))],
        ]);

        return [
            'name'        => $request->name,
            'is_super'    => (bool) $request->boolean('is_super'),
            'permissions' => array_values(array_unique($request->input('permissions', []))),
        ];
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'rol';
        $slug = $base;
        $i = 2;
        while (AdminRole::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        return $slug;
    }

    // Cuenta admins con rol super, opcionalmente excluyendo un rol (para simular
    // el cambio antes de guardarlo).
    private function superAdminsCount(?int $excludeRoleId = null): int
    {
        return AdminAccount::whereHas('role', function ($q) use ($excludeRoleId) {
            $q->where('is_super', true);
            if ($excludeRoleId) {
                $q->where('id', '!=', $excludeRoleId);
            }
        })->count();
    }

    private function roleIsSuper(int $roleId): bool
    {
        return (bool) optional(AdminRole::find($roleId))->is_super;
    }
}
