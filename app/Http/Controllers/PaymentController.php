<?php
namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Activation;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Services\PaymentService;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $ps;

    public function __construct(PaymentService $ps)
    {
        $this->ps = $ps;
    }


public function deposit(Request $request)
{
    $validator = Validator::make($request->all(), [
        'amount_cfa' => 'required|numeric|min:50000|max:1000000',
        'reference' => 'required|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json(['message' => $validator->errors()->first()], 422);
    }

    $user = $request->user();

    // ✅ S'assurer que le wallet existe
    if (!$user->wallet) {
        $user->wallet()->create(['balance_cfa' => 0, 'virtual_balance_cfa' => 0]);
        $user->load('wallet'); // Recharger la relation
    }

    // Créditer le wallet
    $user->wallet->balance_cfa += $request->amount_cfa;
    $user->wallet->save();


    // Enregistrer le dépôt
    $deposit = Deposit::create([
        'user_id' => $user->id,
        'amount_cfa' => $request->amount_cfa,
        'reference' => $request->reference,
        'provider' => 'mobile_money_simulated',
        'provider_tx' => 'SIMULATED-' . now()->format('YmdHis'),
        'status' => 'paid',
        'credited' => true,
        'paid_at' => now(),
    ]);

    return response()->json([
        'message' => 'Dépôt effectué avec succès.',
        'user' => $this->formatUserResponse($user)
    ]);
}

    public function activate(Request $request)
    {
        $user = $request->user();

        if ($user->activated) {
            return response()->json([
                'message' => 'Votre compte est déjà activé.',
                'user' => $this->formatUserResponse($user)
            ]);
        }

        // Appliquer le bonus de 100% sur le solde actuel
        $user->wallet->balance_cfa *= 1.5;
        $user->wallet->save();

        // Activer le compte
        $user->activated = true;
        $user->save();

        // Optionnel : enregistrer l'activation
        Activation::create([
            'user_id' => $user->id,
            'amount_cfa' => 20000,
            'status' => 'paid',
            'reference' => 'SIMULATED-ACT-' . now()->format('YmdHis')
        ]);

        return response()->json([
            'message' => 'Compte activé ! Bonus de 100% appliqué.',
            'user' => $this->formatUserResponse($user)
        ]);
    }

    // Méthode utilitaire (ajoute-la dans la même classe)
    private function formatUserResponse($user)
    {
        $user->loadMissing('wallet');
        return [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'activated' => (bool) $user->activated,
            'balance' => (float) ($user->wallet?->balance_cfa ?? 0),
            'investment_start_at' => $user->investment_start_at?->toDateTimeString(),
            'investment_processed' => $user->investment_processed,
        ];
    }
    /**
     * Webhook public: provider posts payment events here
     * Expects payload to include: reference, status, transaction_id, amount
     */
    public function webhook(Request $req)
    {
        // verify signature
        if (! $this->ps->verifyWebhook($req)) {
            return response('Invalid signature',403);
        }

        $payload = $req->all();
        $reference = $payload['reference'] ?? $payload['merchant_reference'] ?? null;
        $status = strtoupper($payload['status'] ?? $payload['payment_status'] ?? 'FAILED');
        $providerTx = $payload['transaction_id'] ?? $payload['provider_tx'] ?? null;
        $amount = isset($payload['amount']) ? intval($payload['amount']) : null;

        if (! $reference) return response('No reference',400);

        // handle deposit
        if (str_starts_with($reference, 'DEP-')) {
            $deposit = Deposit::where('reference',$reference)->first();
            if (! $deposit) return response('Deposit not found',404);

            if (in_array($status, ['SUCCESS','PAID','COMPLETED'])) {
                // idempotency: if already paid, ignore
                if ($deposit->status === 'paid') return response('Already processed',200);

                $deposit->update(['status'=>'paid','provider_tx'=>$providerTx,'paid_at'=>now()]);

                // immediate credit to real balance
                $wallet = $deposit->user->wallet;
                $wallet->balance_cfa += $deposit->amount_cfa;
                $wallet->save();

                Transaction::create([
                    'user_id'=>$deposit->user_id,
                    'type'=>'deposit',
                    'amount_cfa'=>$deposit->amount_cfa,
                    'meta'=>['provider_tx'=>$providerTx,'deposit_id'=>$deposit->id]
                ]);

                // set user invest flags
                $user = $deposit->user;
                $user->has_invested = true;
                $user->investment_start_at = now();
                $user->investment_processed = false;
                $user->save();
            } else {
                $deposit->update(['status'=>'failed']);
            }

            return response('ok',200);
        }

        // handle activation
        if (str_starts_with($reference, 'ACT-')) {
            $act = Activation::where('reference',$reference)->first();
            if (! $act) return response('Activation not found',404);

            if (in_array($status, ['SUCCESS','PAID','COMPLETED'])) {
                if ($act->status === 'paid') return response('Already processed',200);

                $act->update(['status'=>'paid','provider_tx'=>$providerTx,'paid_at'=>now()]);
                $user = $act->user;
                $user->activated = true;
                $user->activation_tx = $providerTx;
                $user->save();

                Transaction::create(['user_id'=>$user->id,'type'=>'activation','amount_cfa'=>$act->amount_cfa,'meta'=>['provider_tx'=>$providerTx]]);
            } else {
                $act->update(['status'=>'failed']);
            }

            return response('ok',200);
        }

        return response('unhandled',200);
    }


    public function invest(Request $request)
    {
        $user = $request->user();
        $user->load('wallet');

        if (!$user->wallet) {
            return response()->json(['message' => 'Portefeuille non trouvé.'], 400);
        }

        if ($user->wallet->balance_cfa <= 49999) {
            return response()->json(['message' => 'Solde insuffisant pour investir.'], 400);
        }

        // ✅ CORRIGÉ : vérifie qu'un investissement est VRAIMENT en cours
        if ($user->investment_start_at !== null && !$user->investment_processed) {
            return response()->json(['message' => 'Un investissement est déjà en cours.'], 400);
        }

        $user->investment_start_at = now();
        $user->investment_processed = false;
        $user->has_invested = true;
        $user->save();

        return response()->json([
            'message' => 'Investissement lancé ! Rendement de +80% dans 3 heures.',
            'user' => $this->formatUserResponse($user)
        ]);
    }

    // App\Http\Controllers\PaymentController.php

    public function finalizeInvestment(Request $request)
    {
        $user = $request->user();

        if (!$user->wallet) {
            return response()->json(['message' => 'Portefeuille non trouvé.'], 400);
        }

        // ✅ CORRIGÉ : vérifie qu'un investissement est en cours
        if ($user->investment_start_at === null || $user->investment_processed) {
            return response()->json(['message' => 'Aucun investissement en cours à finaliser.'], 400);
        }

        $currentBalance = $user->wallet->balance_cfa;
        $newBalance = floor($currentBalance * 1.8);
        $profit = $newBalance - $currentBalance;

        $user->wallet->balance_cfa = $newBalance;
        $user->wallet->save();

        // ✅ CORRIGÉ : marque comme terminé
        $user->investment_processed = true;
        $user->investment_start_at = null;
        $user->save();

        return response()->json([
            'message' => "Investissement finalisé ! +{$profit} XAF de rendement.",
            'user' => $this->formatUserResponse($user)
        ]);
    }
}
