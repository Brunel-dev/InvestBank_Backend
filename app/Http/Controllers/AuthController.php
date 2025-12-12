<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Wallet;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur.
     */
    public function register(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|unique:users,phone',
            'password' => 'required|string|min:6|confirmed',
            'name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'password' => $request->password, // auto-haché grâce à $casts
            'activated' => false, // ou true selon ta logique métier
        ]);

        // Créer un wallet associé
        Wallet::create([
            'user_id' => $user->id,
            'balance_cfa' => 0,
            'virtual_balance_cfa' => 0,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully. Awaiting activation.',
            'user' => $user->only('id', 'name', 'phone', 'activated'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Connexion d'un utilisateur existant.
     */
    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone', $request->phone)->first();

        // Vérifier que l'utilisateur existe et que le mot de passe est correct
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid phone or password.'
            ], 401);
        }

        // Révoquer les anciens tokens (optionnel, pour sécurité)
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => $user->only('id', 'name', 'phone', 'activated'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Déconnexion (supprime le token actuel).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        // Charger l'utilisateur avec son wallet
        $user = $request->user()->load('wallet');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'activated' => $user->activated,
            'balance' => $user->wallet?->balance ?? 0, // ✅ Ajoute balance ici
            // ou : 'wallet' => $user->wallet
        ]);
    }
}
