import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  Gift,
  Zap,
  Lock,
} from 'lucide-react';
import { Card } from '../ui';
import { User, Transaction } from '../../types';
import api from '../../services/api';
import ContactAgentModal from '../ContactAgentModal';
import WithdrawalModal from '../WithdrawalModal';
import PerformanceChart from '../PerformanceChart';

type Ctx = { user: User; setUser: (u: User) => void; refreshUser: () => Promise<void> };

const formatXAF = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

const typeLabel = (t: string): { label: string; color: string } => {
  switch (t) {
    case 'deposit': return { label: 'Dépôt', color: 'text-emerald-400' };
    case 'gain': return { label: 'Rendement Scalping', color: 'text-blue-400' };
    case 'activation': return { label: 'Activation', color: 'text-purple-400' };
    case 'withdrawal': return { label: 'Retrait', color: 'text-red-400' };
    case 'admin_credit': return { label: 'Crédit administrateur', color: 'text-emerald-400' };
    case 'admin_debit': return { label: 'Débit administrateur', color: 'text-red-400' };
    case 'loan': return { label: 'Prêt', color: 'text-amber-400' };
    case 'grant': return { label: 'Subvention', color: 'text-pink-400' };
    default: return { label: t, color: 'text-slate-300' };
  }
};

const DashboardView: React.FC = () => {
  const { user } = useOutletContext<Ctx>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions')
      .then((r) => setTransactions(r.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Bonjour, {user.name || 'cher client'} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Voici un aperçu de votre activité</p>
      </div>

      {/* Balance card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-32 h-32 text-blue-500" />
        </div>
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium mb-1">Solde disponible</p>
          <h2 className="text-4xl font-bold text-white mb-3">
            {Number(user.balance ?? 0).toLocaleString('fr-FR')}{' '}
            <span className="text-blue-500 text-2xl">XAF</span>
          </h2>
          {!user.activated && (
            <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-sm">
              <Lock className="w-4 h-4" />
              <span>
                Votre compte n'est pas activé. Activez-le pour débloquer toutes les sections.
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setContactOpen(true)}
          className="bg-slate-800 hover:bg-slate-750 border border-emerald-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition"
        >
          <div className="bg-emerald-500/20 p-2.5 rounded-full">
            <ArrowDownLeft className="text-emerald-400 w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-white">Dépôt</span>
        </button>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="bg-slate-800 hover:bg-slate-750 border border-red-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition"
        >
          <div className="bg-red-500/20 p-2.5 rounded-full">
            <ArrowUpRight className="text-red-400 w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-white">Retrait</span>
        </button>
        <Link
          to="/app/scalping"
          className="bg-slate-800 hover:bg-slate-750 border border-blue-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition"
        >
          <div className="bg-blue-500/20 p-2.5 rounded-full">
            <Zap className="text-blue-400 w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-white">Scalping</span>
        </Link>
        <Link
          to="/app/loans"
          className="bg-slate-800 hover:bg-slate-750 border border-amber-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition"
        >
          <div className="bg-amber-500/20 p-2.5 rounded-full">
            <Landmark className="text-amber-400 w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-white">Prêts</span>
        </Link>
        <Link
          to="/app/grants"
          className="bg-slate-800 hover:bg-slate-750 border border-pink-500/30 p-4 rounded-xl flex flex-col items-center gap-2 transition"
        >
          <div className="bg-pink-500/20 p-2.5 rounded-full">
            <Gift className="text-pink-400 w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-white">Subventions</span>
        </Link>
      </div>

      {/* Chart */}
      <PerformanceChart transactions={transactions} currentBalance={Number(user.balance ?? 0)} />

      {/* History */}
      <Card className="bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Historique des opérations</h3>
          <TrendingUp className="w-5 h-5 text-slate-500" />
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm text-center py-8">Chargement...</p>
        ) : transactions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            Aucune opération pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-slate-700">
            {transactions.map((t) => {
              const info = typeLabel(t.type);
              const sign = ['withdrawal', 'admin_debit'].includes(t.type) ? '-' : '+';
              return (
                <li key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{info.label}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <span className={`font-semibold ${info.color}`}>
                    {sign}
                    {formatXAF(t.amount_cfa)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <ContactAgentModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <WithdrawalModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        balance={Number(user.balance ?? 0)}
        activated={Boolean(user.activated)}
      />
    </div>
  );
};

export default DashboardView;
