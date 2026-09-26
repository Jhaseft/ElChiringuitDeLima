<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VersionGuardController extends Controller
{
    public function versionMinima(Request $request)
{
    $platform = strtolower($request->query('platform', ''));

    $version = $platform === 'ios'
        ? config('app.version_app_ios')
        : config('app.version_app_android');

    return response()->json([
        'version_minima' => $version,
    ]);
}
}
