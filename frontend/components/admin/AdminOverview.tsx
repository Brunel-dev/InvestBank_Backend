import React, { useEffect, useState } from 'react';
import { Card } from '../ui';
import { Users, ShieldCheck, Landmark, Gift, Wallet, Activity } from 'lucide-react';
import api from '../../services/api';

interface Stats {
  total_clients: number;
  activated_clients: number;
  pending_loans: number;
  pending_grants: number;
  active_scalpings?: number;
  total_balance: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Erreur de chargement'));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!stats) return <p className="text-slate-400">Chargement...</p>;

  const cards = [
    { label: 'Clients inscrits', value: stats.total_clients, icon: Users, color: 'text-blue-400' },
    { label: 'Comptes activés', value: stats.activated_clients, icon: ShieldCheck, color: 'text-emerald-400' },
    { label: 'Scalpings actifs', value: stats.active_scalpings ?? 0, icon: Activity, color: 'text-cyan-400' },
    { label: 'Prêts en attente', value: stats.pending_loans, icon: Landmark, color: 'text-amber-400' },
    { label: 'Subventions en attente', value: stats.pending_grants, icon: Gift, color: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Vue d'ensemble</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="bg-slate-800 border-slate-700">
            <c.icon className={`w-6 h-6 ${c.color} mb-2`} />
            <p className="text-xs text-slate-400">{c.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{c.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-blue-900/30 to-slate-900 border-blue-500/30">
        <div className="flex items-center gap-4">
          <Wallet className="w-10 h-10 text-blue-400" />
          <div>
            <p className="text-sm text-slate-300">Total des soldes clients</p>
            <p className="text-3xl font-bold text-white">
              {stats.total_balance.toLocaleString('fr-FR')} <span className="text-blue-400 text-lg">XAF</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminOverview;
