import React from 'react';
import { UserPlus, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import { Card } from './ui';
import { useNavigate } from 'react-router-dom';

const LandingView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NovaTrust" className="w-10 h-10" />
          <span className="font-bold text-xl tracking-tight">NovaTrust</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Se Connecter
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2000&auto=format&fit=crop')" }}
        >
           <div className="absolute inset-0 bg-slate-900/80 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center mt-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm mb-6 animate-fade-in">
            La plateforme n°1 en Afrique Francophone
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Faites fructifier votre argent en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">toute simplicité</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'investisseurs et profitez d'un rendement exceptionnel de 80% en seulement 3 heures grâce à notre algorithme de trading haute fréquence.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="group bg-blue-600 hover:bg-blue-500 text-white text-lg px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 mx-auto transform hover:scale-105"
          >
            Commencer maintenant
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* How it works Section */}
      <div className="py-20 px-4 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-slate-400">Un processus simple en 3 étapes pour multiplier vos gains.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/30 transition-colors">
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <UserPlus className="text-blue-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Inscription</h3>
              <p className="text-slate-400 text-sm">
                Créez votre compte gratuitement en quelques secondes avec votre numéro de téléphone.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/30 transition-colors">
              <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-emerald-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Investissement</h3>
              <p className="text-slate-400 text-sm">
                Effectuez un dépôt via Mobile Money. Votre capital travaille automatiquement pour vous.
              </p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/30 transition-colors">
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-purple-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Retrait +80%</h3>
              <p className="text-slate-400 text-sm">
                Après 3 heures, récupérez votre capital plus 80% de bénéfices directement sur votre compte.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-950 py-8 text-center text-slate-600 text-sm">
        <p>© 2024 NovaTrust. Tous droits réservés.</p>
        <p className="mt-2">Investir comporte des risques. N'investissez que ce que vous pouvez vous permettre de perdre.</p>
      </div>
    </div>
  );
};

export default LandingView;
