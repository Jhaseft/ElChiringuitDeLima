<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ExpoPushService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminNotificacionesController extends Controller
{
    public function __construct(private ExpoPushService $push) {}

    public function index()
    {
        return Inertia::render('Admin/Notificaciones');
    }

    public function send(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'body'  => 'required|string|max:500',
        ]);

        $this->push->sendToAll(
            $request->title,
            $request->body,
            ['screen' => '/Home']
        );

        return back()->with('success', 'Notificación enviada a todos los usuarios.');
    }
}
