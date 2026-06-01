import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, Button, Input } from '../ui';
import { User as UserIcon, Mail, Phone, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { User } from '../../types';

type Ctx = {
  user: User;
  setUser: (u: User) => void;
  refreshUser?: () => Promise<void>;
};

interface Props {
  // Permet d'utiliser le composant sans Outlet context (admin).
  user?: User | null;
  onUpdated?: (u: User) => void;
}

const ProfileView: React.FC<Props> = ({ user: userProp, onUpdated }) => {
  const ctx = useOutletContext<Ctx | null>() ?? null;
  const initialUser = userProp ?? ctx?.user ?? null;

  const [me, setMe] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUser) {
      hydrate(initialUser);
      return;
    }
    api.get('/me')
      .then((r) => { setMe(r.data); hydrate(r.data); })
      .catch(() => setError('Impossible de charger le profil.'))
      .finally(() => setLoading(false));
  }, []);

  const hydrate = (u: User) => {
    setName(u.name || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const payload: any = {
        name: name || null,
        email: email || null,
        phone,
      };
      if (password) {
        payload.current_password = currentPassword;
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }
      const r = await api.put('/profile', payload);
      setSuccess(r.data.message);
      setMe(r.data.user);
      ctx?.setUser?.(r.data.user);
      onUpdated?.(r.data.user);
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
    } catch (e: any) {
      const data = e.response?.data;
      if (data?.errors) {
        const firstField = Object.keys(data.errors)[0];
        setError(data.errors[firstField][0]);
      } else {
        setError(data?.message || 'Erreur lors de la mise à jour.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-slate-400">Chargement...</p>;
  }
  if (!me) {
    return <p className="text-red-400">{error || 'Profil indisponible.'}</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Mon profil</h1>
        <p className="text-slate-400 text-sm mt-1">
          Mettez à jour vos informations personnelles et votre mot de passe.
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-white">{me.name || 'Sans nom'}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {me.role === 'admin' ? 'Administrateur' : 'Client NovaTrust'}
              {me.activated ? (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Activé
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </Card>

      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <h3 className="font-bold text-white mb-4">Informations personnelles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-2">Nom complet</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Utilisée pour recevoir les notifications NovaTrust.
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237 690 12 34 56"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-white mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            Changer le mot de passe
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Laissez vide si vous ne souhaitez pas changer votre mot de passe.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-2">Mot de passe actuel</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Nouveau mot de passe</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 caractères"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-2">Confirmer</label>
              <Input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Répéter le nouveau mot de passe"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={submitting} className="w-auto px-8">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileView;
