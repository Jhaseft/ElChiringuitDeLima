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
            'password'         => ['required', 'confirmed', 'digits:4'],
        ]);

        $user = Auth::user();

        $user->update([
            'nationality'      => $request->nationality,
            'phone'            => $request->phone,
            'document_number'  => $request->document_number,
            'password'         => Hash::make($request->password),
        ]);

        return redirect()->route('welcome')->with('success', 'Perfil completado correctamente.');
    }
}
