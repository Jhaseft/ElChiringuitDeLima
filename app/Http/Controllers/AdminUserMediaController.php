<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserMediaController extends Controller
{
    public function index(Request $request)
{
    try {
        $perPage = (int) $request->query('perPage', 10);
        $search  = trim($request->query('search', ''));

        $query = User::query();

        if ($search !== '') {
            // Búsqueda insensible a mayúsculas y con índice
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'LIKE', "$search%")
                  ->orWhere('last_name', 'LIKE', "$search%")
                  ->orWhere('email', 'LIKE', "$search%")
                  ->orWhere('document_number', 'LIKE', "$search%")
                  ->orWhere('phone', 'LIKE', "$search%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($users);

    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
}


    public function show(User $user)
    {
        $user->load([
            'media' => fn($q) => $q->orderBy('position'),
            'accounts.bank',
            'accounts.owner'
        ]);

        return response()->json($user);
    }


}
