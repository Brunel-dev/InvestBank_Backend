import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, Button, Input, Textarea, Select } from '../ui';
import { Gift, CheckCircle2, Upload, Lock, Quote } from 'lucide-react';
import api from '../../services/api';
import { GrantApplication, User } from '../../types';
import ContactAgentModal from '../ContactAgentModal';

type Ctx = { user: User; setUser: (u: User) => void; refreshUser: () => Promise<void> };

const CATEGORIES = [
  'Agriculture',
  'Technologie',
  'Éducation',
  'Santé',
  'Artisanat',
  'Commerce',
  'Environnement',
  'Autre',
];

const TESTIMONIALS = [
  {
    name: 'Aïcha N.',
    project: 'Coopérative agricole — Yaoundé',
    quote: "Grâce à la subvention NovaTrust, nous avons pu équiper 12 femmes en matériel et doubler notre production de manioc.",
    amount: 2500000,
  },
  {
    name: 'Jean-Marc T.',
    project: 'Startup EduTech — Douala',
    quote: "NovaTrust a cru en notre projet quand personne d'autre ne le voyait. Aujourd'hui nous formons 800 élèves.",
    amount: 5000000,
  },
  {
    name: 'Fatou D.',
    project: 'Atelier de couture solidaire — Garoua',
    quote: "Le processus a été simple et rapide. La subvention a transformé notre atelier en véritable PME.",
    amount: 1200000,
  },
];

const GrantView: React.FC = () => {
  const { user } = useOutletContext<Ctx>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [requested, setRequested] = useState('1000000');
  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mine, setMine] = useState<GrantApplication[]>([]);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!user.activated) return;
    api.get('/grants/mine').then((r) => setMine(r.data)).catch(() => {});
  }, [user.activated]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) {
      setError('Veuillez joindre une pièce d\'identité.');
      return;
    }
    if (description.length < 50) {
      setError('La description doit contenir au moins 50 caractères.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append('project_title', title);
      fd.append('category', category);
      fd.append('description', description);
      fd.append('requested_amount_cfa', requested);
      fd.append('full_name', fullName);
      fd.append('phone', phone);
      if (email) fd.append('email', email);
      fd.append('id_document', idFile);

      const r = await api.post('/grants/apply', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(r.data.message);
      setMine((m) => [r.data.grant, ...m]);
      setTitle('');
      setDescription('');
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
          <Gift className="text-pink-400" /> Subventions de projets
        </h1>
        <Card className="border-amber-500/40 bg-amber-500/5">
          <div className="flex flex-col items-center text-center py-8">
            <Lock className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="text-xl font-bold text-white">Compte non activé</h3>
            <p className="text-slate-300 text-sm mt-2 max-w-md">
              Pour soumettre un projet, votre compte doit être activé.
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
          <Gift className="text-pink-400" /> Subventions de projets
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Financements non-remboursables pour vos projets à impact
        </p>
      </div>

      <Card className="bg-pink-500/5 border-pink-500/30">
        <h3 className="font-bold text-white mb-3">Critères d'éligibilité</h3>
        <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
          <li>Avoir un compte NovaTrust activé.</li>
          <li>Présenter un projet réalisable et à impact (économique, social, environnemental).</li>
          <li>Fournir une pièce d'identité valide.</li>
          <li>Décrire le projet en détail (objectifs, bénéficiaires, budget).</li>
          <li>Montant demandé entre 100 000 et 100 000 000 XAF.</li>
        </ul>
      </Card>

      <Card>
        <h3 className="font-bold text-white mb-4">Soumettre un projet</h3>

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
            <label className="block text-sm text-slate-300 mb-2">Titre du projet</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Catégorie</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Montant demandé (XAF)</label>
            <Input type="number" min="100000" max="100000000" value={requested} onChange={(e) => setRequested(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">
              Description ({description.length}/50 min.)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              minLength={50}
              required
              placeholder="Décrivez votre projet, ses objectifs, ses bénéficiaires, l'utilisation des fonds..."
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Nom complet</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Téléphone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Email (optionnel)</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-300 mb-2">Pièce d'identité</label>
            <label className="flex items-center gap-3 cursor-pointer bg-slate-900 border border-dashed border-slate-600 rounded-lg p-4 hover:border-pink-500 transition">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-300">
                {idFile ? idFile.name : 'Sélectionner un fichier (JPG, PNG, PDF)'}
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
              Soumettre mon projet
            </Button>
          </div>
        </form>
      </Card>

      <div>
        <h3 className="font-bold text-white mb-4">Projets financés — Témoignages</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <Quote className="w-6 h-6 text-pink-400/50 mb-2" />
              <p className="text-sm text-slate-200 italic mb-3">"{t.quote}"</p>
              <p className="text-xs text-slate-400">— {t.name}</p>
              <p className="text-xs text-pink-300 mt-1">{t.project}</p>
              <p className="text-xs text-emerald-400 mt-1">
                Financé : {t.amount.toLocaleString('fr-FR')} XAF
              </p>
            </Card>
          ))}
        </div>
      </div>

      {mine.length > 0 && (
        <Card>
          <h3 className="font-bold text-white mb-3">Mes soumissions</h3>
          <ul className="divide-y divide-slate-700">
            {mine.map((g) => (
              <li key={g.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{g.project_title}</p>
                  <p className="text-xs text-slate-500">
                    {g.category} — {g.requested_amount_cfa.toLocaleString('fr-FR')} XAF
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    g.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : g.status === 'rejected'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {g.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default GrantView;
