<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CompleteProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('Auth/CompleteProfile', [
            'user' => Auth::user(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nationality'      => 'required|string|max:255',
            'phone'            => 'required|string|max:255|unique:users,phone,' . Auth::id(),
            'document_number'  => 'required|string|max:255|unique:users,document_number,' . Auth::id(),
            'terms'            => 'accepted',
            'password'         => ['required', 'confirmed', 'min:8'], // Valida confirmación de password
        ]);

        $user = Auth::user();

        $user->update([
            'nationality'      => $request->nationality,
            'phone'            => $request->phone,
            'document_number'  => $request->document_number,
            'accepted_terms_at'=> now(),
            'terms_version'    => '1.0',
            'password'         => Hash::make($request->password),
        ]);

        return redirect()->route('welcome')->with('success', 'Perfil completado correctamente.');
    }
}
