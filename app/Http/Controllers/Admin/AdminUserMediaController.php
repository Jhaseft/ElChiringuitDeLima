<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminUserMediaController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('perPage', 10);
        $search  = trim($request->query('search', ''));

        $query = User::query();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'LIKE', "$search%")
                  ->orWhere('last_name', 'LIKE', "$search%")
                  ->orWhere('email', 'LIKE', "$search%")
                  ->orWhere('document_number', 'LIKE', "$search%")
                  ->orWhere('phone', 'LIKE', "$search%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
                       ->paginate($perPage)
                       ->withQueryString();

        return Inertia::render('Admin/Usuarios', [
            'users'   => $users,
            'filters' => ['search' => $search, 'perPage' => $perPage],
        ]);
    }


public function showUsers(User $user)
{
    $user->load([
        'media' => fn($q) => $q->orderBy('position')
    ]);

    return response()->json([
        'id' => $user->id,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'email' => $user->email,
        'phone' => $user->phone,
        'nationality' => $user->nationality,
        'document_number' => $user->document_number,
        'kyc_status' => $user->kyc_status,
        'kyc_session_id'=>$user->kyc_session_id,
        'media' => $user->media
    ]);
}
 


   public function showAccounts(User $user)
{
    $accounts = $user->accounts()
        ->with(['bank', 'owner'])
        ->get();

    return response()->json($accounts);
}

    // Bloquea el acceso del usuario a la app: marca blocked_at y revoca todos sus
    // tokens Sanctum para cerrarle la sesión activa de inmediato (no solo logins
    // futuros). blocked_at/blocked_reason se asignan explícitamente (no via update
    // masivo) a propósito.
    public function block(Request $request, User $user)
    {
        $data = $request->validate([
            'reason' => 'nullable|string|max:255',
        ]);

        $user->blocked_at = now();
        $user->blocked_reason = $data['reason'] ?? null;
        $user->save();

        $user->tokens()->delete();

        return back()->with('success', 'Usuario bloqueado.');
    }

    // Reactiva el acceso del usuario.
    public function unblock(User $user)
    {
        $user->blocked_at = null;
        $user->blocked_reason = null;
        $user->save();

        return back()->with('success', 'Usuario desbloqueado.');
    }
}
