<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TcCanje;
use Illuminate\Http\Request;
use Inertia\Inertia;
 
class AdminCanjesTcController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->query('search', ''));
        $status = $request->query('status', '');

        $canjes = TcCanje::with(['user', 'producto.categoria'])
            ->when($search, fn($q) => $q->whereHas('user', fn($u) =>
                $u->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name',  'like', "%{$search}%")
                  ->orWhere('email',      'like', "%{$search}%")
                  ->orWhere('phone',      'like', "%{$search}%")
            ))
            ->when($status, fn($q) => $q->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/CanjesTc', [
            'canjes'  => $canjes,
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $canje = TcCanje::findOrFail($id);

        $request->validate([
            'status' => 'required|in:completado,cancelado,pendiente',
            'notas'  => 'nullable|string|max:500',
        ]);

        $canje->update([
            'status' => $request->status,
            'notas'  => $request->notas ?? $canje->notas,
        ]);

        return response()->json($canje->load(['user', 'producto.categoria']));
    }
}
