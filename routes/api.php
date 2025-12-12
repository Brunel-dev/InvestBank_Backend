<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [UserController::class, 'me']);
    Route::post('/deposit', [PaymentController::class, 'deposit']);
    Route::post('/activate', [PaymentController::class, 'activate']);
    Route::post('/withdraw', [PaymentController::class, 'withdraw']);
});


// Protected routes - for simplicity assume token-based or session-based auth middleware exists
Route::middleware(['auth:sanctum'])->group(function() {
Route::post('/deposits/create', [PaymentController::class,'createDeposit']);
Route::post('/activations/create', [PaymentController::class,'createActivation']);
Route::post('/withdrawals/request', [WithdrawalController::class,'request']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/invest', [PaymentController::class, 'invest']);
    Route::post('/finalize-investment', [PaymentController::class, 'finalizeInvestment']);
    // ... tes autres routes
});


// Webhook must be publicly accessible and not auth-protected
Route::post('/webhook/payment', [PaymentController::class,'handleWebhook'])->name('webhook.payment');

use App\Models\User;

// Route::middleware('auth:sanctum')->group(function () {
//     Route::get('/me', function (Request $request) {
//         $user = $request->user()->load('wallet'); // Charger la relation

//         return response()->json([
//             'id' => $user->id,
//             'name' => $user->name,
//             'phone' => $user->phone,
//             'activated' => $user->activated,
//             'balance' => (float) ($user->wallet?->balance_cfa ?? 0),          // ✅ soldes réels
//             'virtual_balance' => (float) ($user->wallet?->virtual_balance_cfa ?? 0), // ✅ soldes virtuels
//         ]);
//     });
// });
