import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, Button } from '../ui';
import {
  Zap,
  Clock,
  Trophy,
  Info,
  TrendingUp,
  CheckCircle2,
  Lock,
  Activity,
  StopCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { User } from '../../types';
import api from '../../services/api';
import ContactAgentModal from '../ContactAgentModal';
import TradingChart from '../TradingChart';

type Ctx = { user: User; setUser: (u: User) => void; refreshUser: () => Promise<void> };

// 48h scalping, +200%, min 50 000 XAF
const DURATION_HOURS = 48;
const DURATION_SECONDS = DURATION_HOURS * 3600;
const GROWTH_RATIO = 2; // +200% = multiplicateur final 3x
const MIN_INVEST_XAF = 50000;
const USDT_RATE_XAF = 605; // 1 USDT = 605 XAF (paramètre indicatif)

const fmtXAF = (n: number) =>
  Math.round(n).toLocaleString('fr-FR') + ' XAF';
const fmtUSDT = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ' USDT';

const fmtCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, '0');
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

interface InvestmentMeta {
  active: boolean;
  duration_seconds: number;
  multiplier: number;
  started_at: string | null;
  elapsed_seconds: number;
  remaining_seconds: number;
  progress: number;
  principal_cfa: number;
  projected_balance_cfa: number;
  target_balance_cfa: number;
}

const ScalpingView: React.FC = () => {
  const { user, setUser, refreshUser } = useOutletContext<Ctx>();
  const [contactOpen, setContactOpen] = useState(false);
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState<InvestmentMeta | null>(null);

  // Fetch initial status from server (single source of truth for start time)
  const fetchStatus = async () => {
    try {
      const r = await api.get('/investment-status');
      setMeta(r.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  // Continuous ticker (1Hz)
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Re-sync with server every 60s to avoid drift
  useEffect(() => {
    const id = setInterval(fetchStatus, 60000);
    return () => clearInterval(id);
  }, []);

  // Computed live values
  const live = useMemo(() => {
    if (!meta || !meta.active || !meta.started_at) {
      return null;
    }
    const startMs = new Date(meta.started_at).getTime();
    const elapsedSec = Math.max(0, Math.min(DURATION_SECONDS, (tick - startMs) / 1000));
    const progress = elapsedSec / DURATION_SECONDS;
    const principal = meta.principal_cfa || 0;
    const projected = principal * (1 + GROWTH_RATIO * progress);
    const remainingMs = Math.max(0, startMs + DURATION_SECONDS * 1000 - tick);
    const gainPerSecond = (principal * GROWTH_RATIO) / DURATION_SECONDS;
    return {
      progress,
      projected,
      principal,
      target: principal * (1 + GROWTH_RATIO),
      remainingMs,
      gainPerSecond,
      elapsedSec,
    };
  }, [meta, tick]);

  const isActive = !!live;
  const isReady = !!live && live.remainingMs === 0;

  // Current display balance in XAF
  const displayXAF = isActive ? live!.projected : Number(user.balance ?? 0);
  const displayUSDT = displayXAF / USDT_RATE_XAF;
  const principalUSDT = (meta?.principal_cfa ?? 0) / USDT_RATE_XAF;
  const targetUSDT = (meta?.target_balance_cfa ?? 0) / USDT_RATE_XAF;

  const invest = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const r = await api.post('/invest', {});
      setMessage(r.data.message);
      await refreshUser();
      await fetchStatus();
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors du démarrage du scalping");
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const r = await api.post('/finalize-investment', {});
      setMessage(r.data.message);
      await refreshUser();
      await fetchStatus();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la finalisation');
    } finally {
      setBusy(false);
    }
  };

  const stopScalping = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const r = await api.post('/stop-investment', {});
      setMessage(r.data.message);
      setStopConfirmOpen(false);
      await refreshUser();
      await fetchStatus();
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de l'arrêt du scalping");
    } finally {
      setBusy(false);
    }
  };

  if (!user.activated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Scalping 48h</h1>
        <Card className="border-amber-500/40 bg-amber-500/5">
          <div className="flex flex-col items-center text-center py-8">
            <Lock className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="text-xl font-bold text-white">Compte non activé</h3>
            <p className="text-slate-300 text-sm mt-2 max-w-md">
              Pour accéder au scalping, veuillez d'abord activer votre compte via un agent.
            </p>
            <Button variant="warning" className="mt-6 w-auto px-6" onClick={() => setContactOpen(true)}>
              Contacter un agent
            </Button>
          </div>
        </Card>
        <ContactAgentModal open={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Zap className="text-blue-400" /> Scalping 48h — USDT
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Trading algorithmique haute fréquence — Capital crypté en USDT pendant 48h, rendement total +200%
        </p>
      </div>

      <Card className="bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/30">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" /> Comment ça marche ?
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
          <li>Solde minimum requis : <strong>{MIN_INVEST_XAF.toLocaleString('fr-FR')} XAF</strong>.</li>
          <li>Lors du lancement, votre solde XAF est <strong>converti en USDT</strong> (taux : 1 USDT = {USDT_RATE_XAF} XAF).</li>
          <li>Notre algorithme exécute des micro-transactions sur le marché USDT pendant <strong>{DURATION_HOURS}h</strong>.</li>
          <li>À la fin, cliquez sur <strong>"Récupérer mes gains"</strong> pour reconvertir en XAF.</li>
        </ol>
      </Card>

      {/* Live balance ticker */}
      <Card className={`relative overflow-hidden ${isActive ? 'border-emerald-500/40' : 'border-slate-700'}`}>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Solde USDT en temps réel */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-sm">Solde en cours (USDT)</p>
              {isActive && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Trading actif
                </span>
              )}
            </div>
            <p className="font-mono text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight">
              {fmtUSDT(displayUSDT)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              ≈ {fmtXAF(displayXAF)}
            </p>
            {isActive && live && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{(live.gainPerSecond / USDT_RATE_XAF).toFixed(6)} USDT / sec
              </p>
            )}
          </div>

          {/* Compte à rebours */}
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            {isActive && live ? (
              <>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Temps restant</p>
                <p className="font-mono text-3xl text-blue-400 mt-1 tabular-nums">
                  {fmtCountdown(live.remainingMs)}
                </p>
                <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                    style={{ width: `${live.progress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Progression : {(live.progress * 100).toFixed(2)}%
                </p>
              </>
            ) : isReady ? (
              <div className="text-center">
                <Trophy className="w-12 h-12 mx-auto text-amber-400 mb-2" />
                <p className="text-emerald-400 font-semibold">Session terminée</p>
                <p className="text-xs text-slate-400 mt-1">Récupérez vos gains</p>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun scalping en cours</p>
              </div>
            )}
          </div>
        </div>

        {/* Bornes principal / objectif quand actif */}
        {isActive && (
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-500">Capital initial</p>
              <p className="font-mono text-white">{fmtUSDT(principalUSDT)}</p>
              <p className="text-xs text-slate-500">{fmtXAF(meta?.principal_cfa ?? 0)}</p>
            </div>
            <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/30">
              <p className="text-xs text-emerald-300">Objectif (+200%)</p>
              <p className="font-mono text-emerald-300">{fmtUSDT(targetUSDT)}</p>
              <p className="text-xs text-emerald-400/70">{fmtXAF(meta?.target_balance_cfa ?? 0)}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row gap-3">
          {!isActive && !isReady && (
            <Button
              onClick={invest}
              isLoading={busy}
              disabled={Number(user.balance ?? 0) < MIN_INVEST_XAF}
              className="md:w-auto md:px-8"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Investir maintenant
            </Button>
          )}
          {isReady && (
            <Button variant="success" onClick={finalize} isLoading={busy} className="md:w-auto md:px-8">
              <Trophy className="w-5 h-5 inline mr-2" />
              Récupérer mes gains
            </Button>
          )}
          {isActive && !isReady && (
            <Button
              variant="danger"
              onClick={() => setStopConfirmOpen(true)}
              disabled={busy}
              className="md:w-auto md:px-8"
            >
              <StopCircle className="w-5 h-5 inline mr-2" />
              Arrêter le scalping
            </Button>
          )}
          {Number(user.balance ?? 0) < MIN_INVEST_XAF && !isActive && (
            <p className="text-amber-400 text-sm self-center">
              Solde insuffisant — minimum {MIN_INVEST_XAF.toLocaleString('fr-FR')} XAF.{' '}
              <button onClick={() => setContactOpen(true)} className="underline">
                Effectuer un dépôt
              </button>
            </p>
          )}
        </div>
      </Card>

      {/* Trading chart */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Marché USDT — flux en direct
          </h3>
          {/* <span className="text-xs text-slate-500">Données simulées à des fins illustratives</span> */}
        </div>
        <TradingChart basePrice={1.0000} active={isActive} height={280} />
      </Card>

      <ContactAgentModal open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* Confirmation modal: stop scalping */}
      {stopConfirmOpen && live && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-500/40 relative my-4 sm:my-8">
            <button
              onClick={() => setStopConfirmOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Arrêter le scalping ?</h3>
              <p className="text-slate-300 text-sm mt-2">
                Si vous arrêtez maintenant, votre gain sera figé au montant actuel.
                Vous ne pourrez pas atteindre les +200% prévus à 48h.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Progression</span>
                <span className="text-white font-mono">{(live.progress * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capital initial</span>
                <span className="text-white font-mono">{fmtXAF(live.principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Solde verrouillé</span>
                <span className="text-emerald-300 font-mono font-bold">{fmtXAF(live.projected)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                <span className="text-slate-400">Gain</span>
                <span className="text-emerald-400 font-bold">
                  +{fmtXAF(live.projected - live.principal)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStopConfirmOpen(false)} className="w-1/2">
                Continuer le scalping
              </Button>
              <Button variant="danger" onClick={stopScalping} isLoading={busy} className="w-1/2">
                Confirmer l'arrêt
              </Button>
            </div>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScalpingView;
