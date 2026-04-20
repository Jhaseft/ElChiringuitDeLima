<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transfer;

class ReportesController extends Controller
{
    public function index(){
        $transfer=Transfer::where('status','completed')->sum('amount');
        
    }
}
