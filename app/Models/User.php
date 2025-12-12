<?php


namespace App\Models;


use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
use HasFactory, Notifiable, HasApiTokens;


    protected $fillable = [
        'name',
        'phone',
        'password',
        'activated',
        'has_invested',           // ✅ ajouté
        'investment_start_at',    // ✅ ajouté
        'investment_processed',   // ✅ ajouté
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'activated' => 'boolean',
        'has_investvested' => 'boolean',       // ✅
        'investment_processed' => 'boolean',   // ✅
        'investment_start_at' => 'datetime',   // ✅
        'password' => 'hashed',
    ];


public function wallet()
{
return $this->hasOne(Wallet::class);
}


public function deposits()
{
return $this->hasMany(Deposit::class);
}


public function activations()
{
return $this->hasMany(Activation::class);
}


public function withdrawals()
{
return $this->hasMany(Withdrawal::class);
}


public function transactions()
{
return $this->hasMany(Transaction::class);
}
}
