import React, { useState } from 'react';
import { ArrowDownLeft, TrendingUp, Phone, Lock, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { Card, Input, Button } from './ui';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthViewProps {
  mode: 'login' | 'register';
  setUser: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ mode, setUser }) => {
  const [loginPhone, setLoginPhone] = useState('');
  const [name, setName] = useState(''); // ajouté pour l'inscription
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState(''); // ajouté pour register
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let payload: any = { phone: loginPhone, password };

      // Pour l'inscription, ajouter name et password_confirmation
      if (mode === 'register') {
        payload = {
          phone: loginPhone,
          name: name || undefined, // envoyer null si vide → Laravel gère comme nullable
          password,
          password_confirmation: passwordConfirmation,
        };
      }

      const endpoint = mode === 'login' ? '/login' : '/register';
      const { data } = await api.post(endpoint, payload);

      // 🔑 Correction majeure : le token est dans `access_token`, pas `token`
      const token = data.access_token;
      localStorage.setItem('token', token);

      // Récupérer les infos utilisateur
      const meResponse = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Laravel renvoie directement l'objet user (pas `user.user`)
      setUser(meResponse.data);
      navigate('/myAccount');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (mode === 'login' ? 'Erreur de connexion' : "Erreur lors de l'inscription");
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 text-white/70 hover:text-white flex items-center gap-2"
      >
        <ArrowDownLeft className="w-4 h-4 rotate-90" />
        Retour
      </button>

      <Card className="w-full max-w-md relative z-10 border-t-4 border-t-blue-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
            <TrendingUp className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="text-slate-400">
            {mode === 'login'
              ? 'Accédez à votre tableau de bord'
              : 'Créez votre compte pour commencer'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ téléphone (commun) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Numéro de téléphone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Ex: +237 690 12 34 56"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="pl-12"
                required
              />
            </div>
          </div>

          {/* Champ nom (inscription uniquement) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nom (optionnel)</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
          )}

          {/* Mot de passe (commun) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12"
                required
              />
            </div>
          </div>

          {/* Confirmation mot de passe (inscription uniquement) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit" isLoading={isProcessing}>
            {mode === 'login' ? 'Se Connecter' : "S'inscrire"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-center text-slate-500">
          {mode === 'login' ? (
            <>
              Pas de compte ?{' '}
              <span
                onClick={() => navigate('/register')}
                className="text-blue-400 underline cursor-pointer"
              >
                Inscrivez-vous
              </span>
            </>
          ) : (
            <>
              Déjà inscrit ?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-blue-400 underline cursor-pointer"
              >
                Connectez-vous
              </span>
            </>
          )}
        </p>
      </Card>
    </div>
  );
};

export default AuthView;