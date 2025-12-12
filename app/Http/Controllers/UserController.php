<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
   // App\Http\Controllers\UserController.php

    public function me(Request $request)
    {
        $user = $request->user()->load('wallet');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'activated' => (bool) $user->activated,
            'has_invested' => (bool) $user->has_invested,
            'investment_start_at' => $user->investment_start_at,
            'investment_processed' => (bool) $user->investment_processed,
            'balance' => (float) ($user->wallet?->balance_cfa ?? 0), // ✅ à la racine
            'wallet' => $user->wallet, // optionnel
        ]);
    }
}
