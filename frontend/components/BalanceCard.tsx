import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from './ui';
import Toast from './ui';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  Clock,
  Phone,
  CheckCircle2,
  Info,
  Lock,
  ShieldCheck,
  Trophy,
  Zap
} from 'lucide-react';
import { User } from '../types';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const OWNER_PHONE_NUMBER = '+237 699 00 11 22';
const ACTIVATION_FEE = 20000;
const INVESTMENT_MULTIPLIER = 1.8;
const INVESTMENT_DURATION_HOURS = 3;

interface BalanceCardProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ user, setUser }) => {
  const [userData, setUserData] = useState<User | null>(user);
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReference, setDepositReference] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeModal, setActiveModal] = useState<'deposit' | 'activate' | 'withdraw' | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Gestion des toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Charger l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me');
        console.log(res.data)
        setUserData(res.data);
      } catch (err) {
        console.error('Failed to load user', err);
        setUser(null);
      }
      
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    }
  };

  // ✅ VALIDATION EN TEMPS RÉEL
  const isDepositAmountValid = () => {
    const amount = parseFloat(depositAmount);
    return amount >= 50000 && amount <= 1000000;
  };

  const isDepositReferenceValid = () => {
    return depositReference.trim().length >= 6;
  };

  const isDepositFormValid = () => {
    return isDepositAmountValid() && isDepositReferenceValid();
  };

  const processDeposit = async () => {
    if (!isDepositReferenceValid()) {
      showToast("La référence doit contenir au moins 6 caractères.", "error");
      return;
    }

    if (!isDepositAmountValid()) {
      showToast("Le montant doit être entre 50 000 XAF et 1 000 000 XAF", "error");
      return;
    }

    if (!userData) {
      showToast("Utilisateur invalide. Veuillez recharger la page.", "error");
      return;
    }

    try {
      const response = await api.post('/deposit', {
        amount_cfa: parseFloat(depositAmount),
        reference: depositReference.trim(),
      });

      setUserData(response.data.user);
      setActiveModal(null);
      setDepositAmount('');
      setDepositReference('');
      showToast(response.data.message, "success");
    } catch (err: any) {
      console.error('Deposit error:', err);
      showToast(err.response?.data?.message || "Erreur lors du dépôt", "error");
    }
  };

  const handleInvest = async () => {
    if (!userData) return;
    try {
      const response = await api.post('/invest', {});
      console.log('Réponse investissement:', response.data);
      setUserData(response.data.user);
      showToast(response.data.message, "success");
    } catch (err: any) {
      console.error('Erreur investissement:', err);
      showToast(err.response?.data?.message || "Erreur lors de l'investissement", "error");
    }
  };

  const finalizeInvestment = async () => {
    if (!userData) return;
    try {
      const response = await api.post('/finalize-investment', {});
      setUserData(response.data.user);
      showToast(response.data.message, "success");
    } catch (err: any) {
      console.error('Erreur finalisation:', err);
      showToast(err.response?.data?.message || "Impossible de finaliser l’investissement", "error");
    }
  };

  const processActivation = async () => {
    if (!userData) return;
    try {
      const response = await api.post('/activate', {});
      setUserData(response.data.user);
      setActiveModal(null);
      setShowSuccessModal(true);
      showToast("Compte activé avec succès !", "success");
    } catch (err: any) {
      console.error('Activation error:', err);
      showToast(err.response?.data?.message || "Erreur lors de l'activation", "error");
    }
  };

  const openWhatsApp = () => {
    // WhatsApp désactivé
  };

  // Gestion du timer d'investissement
  const [investmentEndTime, setInvestmentEndTime] = useState<number | null>(null);
  useEffect(() => {
    if (userData?.investment_start_time) {
      const date = new Date(userData.investment_start_time);
      if (!isNaN(date.getTime())) {
        const endTime = date.getTime() + INVESTMENT_DURATION_HOURS * 60 * 60 * 1000;
        setInvestmentEndTime(endTime);
      }
    } else {
      setInvestmentEndTime(null);
    }
    
  }, [userData?.investment_start_time]);

  const isInvestmentActive = investmentEndTime && Date.now() < investmentEndTime;
  const isInvestmentCompleted = userData?.investment_processed;
  const potentialBalance = userData ? Math.floor(userData.balance * INVESTMENT_MULTIPLIER) : 0;
  const canWithdraw = userData?.balance > 49999 && !isInvestmentActive;


  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 relative">
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">NovaTrust</span>
          </div>
          {/* Logout button removed per request in previous step, ensuring consistency */}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-slate-800/50 border-slate-700 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">Bonjour, {userData?.name || 'Utilisateur'} !</h3>
              <div className="flex items-center gap-2 mt-1">
                {userData?.activated ? (
                  <span className="text-emerald-400 text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Compte activé
                  </span>
                ) : (
                  <span className="text-amber-400 text-sm flex items-center gap-1">
                    <Info className="w-4 h-4" /> Compte non activé
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Téléphone</p>
              <p className="text-white font-mono">{userData?.phone}</p>
            </div>
          </div>
        </Card>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-32 h-32 text-blue-500" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">Solde Total</p>
            <h2 className="text-4xl font-bold text-white mb-2">
              {userData?.balance.toLocaleString('fr-FR') ?? '0'}{' '}
              <span className="text-blue-500 text-2xl">XAF</span>
            </h2>
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
              <span>+80% de rendement potentiel</span>
            </div>
          </div>
        </Card>

        {/* Investissement en cours */}
        {!userData?.investment_processed && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-blue-500/20 p-2 rounded-full animate-pulse">
              <Clock className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <p className="text-white font-medium">Investissement en cours</p>
              <p className="text-sm text-blue-300">
                Votre solde augmentera à {potentialBalance.toLocaleString('fr-FR')} XAF dans{' '}
                {Math.ceil((investmentEndTime! - Date.now()) / (1000 * 60))} min.
              </p>
            </div>
            <button
              onClick={finalizeInvestment}
              className="bg-slate-800 hover:bg-slate-750 border border-purple-500/50 p-6 rounded-xl flex flex-col items-center gap-3 transition-colors group shadow-lg shadow-purple-900/20"
            >
              <div className="bg-purple-500/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                <Trophy className="text-purple-400 w-6 h-6" />
              </div>
              <span className="font-semibold text-white">Finaliser</span>
            </button>
          </div>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveModal('deposit')}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 p-6 rounded-xl flex flex-col items-center gap-3 transition-colors group"
          >
            <div className="bg-emerald-500/20 p-3 rounded-full group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="text-emerald-400 w-6 h-6" />
            </div>
            <span className="font-semibold text-white">Dépôt</span>
          </button>

          {/* Bouton Investir: Uniquement si solde >= 50000 et pas encore investi */}
          {userData?.balance >= 50000 && !isInvestmentActive && (
             <button
             onClick={handleInvest}
             className="bg-slate-800 hover:bg-slate-750 border border-blue-500/50 p-6 rounded-xl flex flex-col items-center gap-3 transition-colors group shadow-lg shadow-blue-900/20"
           >
             <div className="bg-blue-500/20 p-3 rounded-full group-hover:scale-110 transition-transform animate-pulse">
               <Zap className="text-blue-400 w-6 h-6" />
             </div>
             <span className="font-semibold text-white">Investir</span>
           </button>
          )}

          <button
            onClick={() => {
           
              if (!userData?.activated) {
                setActiveModal('activate');
              } else {
                setActiveModal('withdraw');
              }
            }}
            disabled={!canWithdraw}
              className={`bg-slate-800 border border-slate-700 p-6 rounded-xl flex flex-col items-center gap-3 transition-colors group ${
                  !canWithdraw ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-750'  // MODIF: Correction de la syntaxe. Applique opacity et cursor quand désactivé.
                }`}
          >
            <div className="bg-red-500/20 p-3 rounded-full group-hover:scale-110 transition-transform">
              <ArrowUpRight className="text-red-400 w-6 h-6" />
            </div>
            <span className="font-semibold text-white">Retrait</span>
          </button>
        </div>
      </main>

      {/* Modal Bienvenue */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-blue-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bienvenue sur NovaTrust !</h3>
              <p className="text-slate-300 text-sm">Voici comment tout fonctionne :</p>
            </div>
            <div className="space-y-4 text-left text-slate-300 text-sm">
              <div className="flex gap-3">
                <div className="bg-blue-500/10 p-2 rounded-full mt-1">
                  <ArrowDownLeft className="text-blue-400 w-4 h-4" />
                </div>
                <p><span className="font-semibold">Dépôt :</span> Envoyez de l’argent via Mobile Money.</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-full mt-1">
                  <TrendingUp className="text-emerald-400 w-4 h-4" />
                </div>
                <p><span className="font-semibold">Investissement :</span> Apparaît dès 50 000 XAF.</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-amber-500/10 p-2 rounded-full mt-1">
                  <Lock className="text-amber-400 w-4 h-4" />
                </div>
                <p><span className="font-semibold">Activation :</span> 20 000 XAF pour débloquer les retraits.</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-green-500/10 p-2 rounded-full mt-1">
                  <Phone className="text-green-400 w-4 h-4" />
                </div>
                <p><span className="font-semibold">Retrait :</span> Disponible après investissement.</p>
              </div>
            </div>
            <div className="mt-8">
              <Button onClick={() => setShowWelcomeModal(false)} className="w-full">
                Ok, j’ai compris !
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Succès Activation */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300">
          <Card className="w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 border-amber-500/30">
            <div className="text-center py-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Trophy className="text-amber-400 w-12 h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Félicitations !</h3>
              <p className="text-slate-300 mb-6 px-6">
                Votre compte a été activé avec succès.<br/>
                <span className="text-amber-400 font-bold block mt-2 text-lg">
                    Vous avez reçu un bonus de +50% !
                </span>
              </p>
              <div className="px-6">
                <Button 
                    variant="warning"
                    onClick={() => {
                        setShowSuccessModal(false);
                        setActiveModal('withdraw');
                    }} 
                    className="w-full font-bold shadow-amber-900/40"
                >
                  Génial !
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Dépôt */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Effectuer un Dépôt</h3>
            <p className="text-slate-400 text-sm mb-6">
              Envoyez le montant par Mobile Money, puis saisissez la référence ici.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Référence Mobile Money</label>
                <Input
                  type="text"
                  placeholder="Ex: 1234567890"
                  value={depositReference}
                  onChange={(e) => setDepositReference(e.target.value)}
                  className="w-full text-black"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Montant (XAF)</label>
                <Input
                  type="number"
                  min="50000"
                  max="1000000"
                  placeholder="Ex: 100000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-black"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setActiveModal(null)} className="w-1/3">
                  Annuler
                </Button>
                <Button
                  className="w-2/3"
                  onClick={processDeposit}
                  disabled={!depositReference.trim() || !depositAmount.trim()}
                >
                  Confirmer le dépôt
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Activation */}
      {activeModal === 'activate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md border-amber-500/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Activer votre compte</h3>
              <p className="text-slate-300 text-sm mt-2">
                Envoyez <strong>20 000 XAF</strong> à {OWNER_PHONE_NUMBER}.<br/>
                Vous recevrez un <strong>bonus de 50%</strong> sur votre solde.
              </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-6">
              <p className="text-amber-400 font-bold text-lg text-center">
                {ACTIVATION_FEE.toLocaleString()} XAF
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setActiveModal(null)} className="w-1/3">
                Annuler
              </Button>
              <Button
                variant="warning"
                className="w-2/3"
                onClick={processActivation}
              >
                J’ai effectué le paiement
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Retrait */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Demande de retrait</h3>
              <p className="text-slate-300 text-sm mt-2">
                Cliquez ci-dessous pour contacter l’agent WhatsApp.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="success" onClick={openWhatsApp} className="gap-2 cursor-default active:scale-100">
                <Phone className="w-5 h-5" />
                Contacter l'agent sur WhatsApp
              </Button>
              <Button variant="secondary" onClick={() => setActiveModal(null)}>
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;