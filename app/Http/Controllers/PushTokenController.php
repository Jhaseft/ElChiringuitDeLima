<?php
 
namespace App\Http\Controllers;

use App\Models\PushToken;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    public function store(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        PushToken::updateOrCreate(
            ['token' => $request->token],
            ['user_id' => $request->user()->id]
        );

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        PushToken::where('user_id', $request->user()->id)
            ->where('token', $request->token)
            ->delete();

        return response()->json(['ok' => true]);
    }
}
