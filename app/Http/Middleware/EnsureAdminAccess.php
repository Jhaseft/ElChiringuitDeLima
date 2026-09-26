<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAccess
{
    /**
     * Corta el acceso a una pestana del panel si el rol del admin no la incluye.
     * Uso: ->middleware('admin.can:usuarios'). Los roles is_super pasan siempre.
     * La restriccion real vive aqui (backend); el filtrado del sidebar es solo UX.
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        $admin = Auth::guard('admin')->user();

        if (!$admin || !$admin->canAccess($module)) {
            abort(403, 'No tienes acceso a esta seccion.');
        }

        return $next($request);
    }
}
