import React from 'react';
import { User, ModalType } from '../types';
import { ArrowDownLeft, TrendingUp, CheckCircle2 } from 'lucide-react';

interface RecentActivityProps {
  user: User | null;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ user }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-bold text-white">Historique récent</h3>
    <div className="space-y-2">
      {user?.balance === 0 && <p className="text-slate-500 text-sm text-center py-4">Aucune transaction.</p>}

      {user?.hasInvested && (
         <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border-l-4 border-emerald-500">
           <div className="flex items-center gap-3">
             <div className="bg-emerald-500/10 p-2 rounded-full">
               <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
             </div>
             <div>
               <p className="text-white font-medium">Dépôt Investissement</p>
               <p className="text-xs text-slate-500">Mobile Money</p>
             </div>
           </div>
           <span className="text-emerald-400 font-bold">Succès</span>
         </div>
      )}

      {user?.investmentProcessed && (
         <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border-l-4 border-blue-500">
           <div className="flex items-center gap-3">
             <div className="bg-blue-500/10 p-2 rounded-full">
               <TrendingUp className="w-4 h-4 text-blue-500" />
             </div>
             <div>
               <p className="text-white font-medium">Rendement 80%</p>
               <p className="text-xs text-slate-500">Automatique</p>
             </div>
           </div>
           <span className="text-blue-400 font-bold">Crédité</span>
         </div>
      )}

      {user?.isActivated && (
          <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-2 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-white font-medium">Activation Compte</p>
              <p className="text-xs text-slate-500">Frais de service</p>
            </div>
          </div>
          <span className="text-purple-400 font-bold">Actif</span>
        </div>
      )}
    </div>
  </div>
);

export default RecentActivity;
