import React, { useEffect, useState } from 'react';
import { Card } from '../ui';
import { Activity, TrendingUp } from 'lucide-react';
import api from '../../services/api';

interface ActiveScalping {
  user_id: number;
  name: string | null;
  phone: string;
  email: string | null;
  started_at: string;
  elapsed_seconds: number;
  remaining_seconds: number;
  progress: number;
  principal_cfa: number;
  projected_balance_cfa: number;
  target_balance_cfa: number;
}

const fmtCountdown = (s: number) => {
  const total = Math.max(0, Math.floor(s));
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const sec = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
};

const AdminScalping: React.FC = () => {
  const [items, setItems] = useState<ActiveScalping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(Date.now());

  const load = () => {
    api.get('/admin/scalpings/active')
      .then((r) => setItems(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const r = setInterval(load, 30000);
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => { clearInterval(r); clearInterval(t); };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Activity className="w-7 h-7 text-emerald-400" />
          Scalpings en cours
        </h1>
        <span className="text-xs text-slate-400">{items.length} session(s) active(s)</span>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {loading ? (
        <Card><p className="text-slate-400 text-center py-8">Chargement...</p></Card>
      ) : items.length === 0 ? (
        <Card><p className="text-slate-400 text-center py-8">Aucun scalping en cours.</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            // recalc live remaining
            const startMs = new Date(s.started_at).getTime();
            const totalDuration = 48 * 3600 * 1000;
            const remainingMs = Math.max(0, startMs + totalDuration - tick);
            const elapsedSec = Math.min(48 * 3600, (tick - startMs) / 1000);
            const progress = elapsedSec / (48 * 3600);
            const projected = s.principal_cfa * (1 + 2 * progress);

            return (
              <Card key={s.user_id} className="bg-slate-900 border-slate-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-[220px]">
                    <p className="font-semibold text-white">
                      {s.name || 'Sans nom'} <span className="text-xs text-slate-500">#{s.user_id}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{s.phone}</p>
                    {s.email && <p className="text-xs text-slate-500">{s.email}</p>}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Capital initial</p>
                    <p className="font-mono text-sm text-white">
                      {s.principal_cfa.toLocaleString('fr-FR')} XAF
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-emerald-400">Solde projeté</p>
                    <p className="font-mono text-sm text-emerald-300 tabular-nums">
                      {Math.round(projected).toLocaleString('fr-FR')} XAF
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                      <TrendingUp className="w-3 h-3" /> Objectif {s.target_balance_cfa.toLocaleString('fr-FR')} XAF
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-blue-300">Temps restant</p>
                    <p className="font-mono text-sm text-blue-300 tabular-nums">
                      {fmtCountdown(remainingMs / 1000)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Démarré : {new Date(s.started_at).toLocaleString('fr-FR')} — Progression {(progress * 100).toFixed(2)}%
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminScalping;
