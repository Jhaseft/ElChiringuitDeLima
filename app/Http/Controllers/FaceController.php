<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class FaceController extends Controller
{
    public function index()
    {
        return Inertia::render('Face/FaceKycSteps');
    }
}
