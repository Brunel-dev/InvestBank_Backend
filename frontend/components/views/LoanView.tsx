import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, Button, Input } from '../ui';
import { Landmark, Calculator, FileText, CheckCircle2, Upload, Info, Lock } from 'lucide-react';
import api from '../../services/api';
import { LoanApplication, User } from '../../types';
import ContactAgentModal from '../ContactAgentModal';

type Ctx = { user: User; setUser: (u: User) => void; refreshUser: () => Promise<void> };

const RATE = 8.5;

const computeMonthly = (principal: number, annualRate: number, months: number) => {
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  const m = (principal * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
  return Math.round(m);
};

const LoanView: React.FC = () => {
  const { user } = useOutletContext<Ctx>();
  const [amount, setAmount] = useState('500000');
  const [duration, setDuration] = useState('12');
  const [purpose, setPurpose] = useState('');
  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mine, setMine] = useState<LoanApplication[]>([]);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!user.activated) return;
    api.get('/loans/mine').then((r) => setMine(r.data)).catch(() => {});
  }, [user.activated]);

  const sim = useMemo(() => {
    const a = parseInt(amount) || 0;
    const d = parseInt(duration) || 1;
    if (a < 50000 || d < 3) return null;
    const monthly = computeMonthly(a, RATE, d);
    const total = monthly * d;
    return { monthly, total, interest: total - a };
  }, [amount, duration]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) {
      setError('Veuillez joindre une pièce d\'identité.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append('full_name', fullName);
      fd.append('phone', phone);
      if (email) fd.append('email', email);
      fd.append('amount_cfa', amount);
      fd.append('duration_months', duration);
      fd.append('purpose', purpose);
      fd.append('id_document', idFile);

      const r = await api.post('/loans/apply', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(r.data.message);
      setMine((m) => [r.data.loan, ...m]);
      setPurpose('');
      setIdFile(null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user.activated) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Landmark className="text-amber-400" /> Prêts bancaires
        </h1>
        <Card className="border-amber-500/40 bg-amber-500/5">
          <div className="flex flex-col items-center text-center py-8">
            <Lock className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="text-xl font-bold text-white">Compte non activé</h3>
            <p className="text-slate-300 text-sm mt-2 max-w-md">
              L'accès aux prêts bancaires nécessite un compte activé.
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
          <Landmark className="text-amber-400" /> Prêts bancaires
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Obtenez un prêt rapidement à un taux compétitif
        </p>
      </div>

      <Card className="bg-amber-500/5 border-amber-500/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 mt-0.5" />
          <div className="text-sm text-slate-200 space-y-1">
            <p><strong>Taux annuel :</strong> {RATE}% (fixe)</p>
            <p><strong>Montant :</strong> 50 000 XAF — 50 000 000 XAF</p>
            <p><strong>Durée :</strong> 3 — 60 mois</p>
            <p><strong>Conditions :</strong> compte activé, pièce d'identité valide.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" /> Simulateur
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Montant (XAF)</label>
            <Input type="number" min="50000" max="50000000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Durée (mois)</label>
            <Input type="number" min="3" max="60" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>

        {sim && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400">Mensualité</p>
              <p className="text-lg font-bold text-blue-400 mt-1">
                {sim.monthly.toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400">Coût total</p>
              <p className="text-lg font-bold text-white mt-1">
                {sim.total.toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400">Intérêts</p>
              <p className="text-lg font-bold text-amber-400 mt-1">
                {sim.interest.toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" /> Demande rapide
        </h3>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Nom complet</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Téléphone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email (optionnel)</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Objet du prêt</label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Ex : achat véhicule, fonds de roulement..." required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Pièce d'identité (JPG, PNG, PDF — max 5 Mo)</label>
            <label className="flex items-center gap-3 cursor-pointer bg-slate-900 border border-dashed border-slate-600 rounded-lg p-4 hover:border-blue-500 transition">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-300">
                {idFile ? idFile.name : 'Sélectionner un fichier'}
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" isLoading={submitting}>
              Soumettre ma demande
            </Button>
          </div>
        </form>
      </Card>

      {mine.length > 0 && (
        <Card>
          <h3 className="font-bold text-white mb-3">Mes demandes</h3>
          <ul className="divide-y divide-slate-700">
            {mine.map((l) => (
              <li key={l.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {l.amount_cfa.toLocaleString('fr-FR')} XAF sur {l.duration_months} mois
                  </p>
                  <p className="text-xs text-slate-500">{l.purpose}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    l.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : l.status === 'rejected'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {l.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default LoanView;
