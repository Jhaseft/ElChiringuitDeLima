<?php
// app/Http/Controllers/AdminAuthController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminAccount;
use Inertia\Inertia;
class AdminAuthController extends Controller
{
    public function showLoginForm()
    {
        if (Auth::guard('admin')->check()) {
        return redirect('/admin/tipo-cambio');
    }
    return Inertia::render('Admin/login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('admin')->attempt($request->only('email','password'))) {
            // Login exitoso
            return response()->json([
                'success' => true,
                'redirect' => url('/admin/tipo-cambio')
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Credenciales incorrectas'
        ], 401);
    }


    public function logout()
    {
        Auth::guard('admin')->logout();
        return redirect('/admin/login');
    }
}