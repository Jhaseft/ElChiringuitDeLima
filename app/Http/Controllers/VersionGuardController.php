<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VersionGuardController extends Controller
{
    public function versionMinima()
{
    return response()->json([
        'version_minima' => config('app.version_app')
    ]);
}
}
