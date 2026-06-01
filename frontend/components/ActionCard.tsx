import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface ActionCardProps {
  type: 'deposit' | 'withdraw';
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ type, onClick }) => {
  const isDeposit = type === 'deposit';
  return (
    <button 
      onClick={onClick}
      className="bg-slate-800 hover:bg-slate-750 border border-slate-700 p-6 rounded-xl flex flex-col items-center gap-3 transition-colors group"
    >
      <div className={`${isDeposit ? 'bg-emerald-500/20' : 'bg-red-500/20'} p-3 rounded-full group-hover:scale-110 transition-transform`}>
        {isDeposit ? <ArrowDownLeft className="text-emerald-400 w-6 h-6" /> : <ArrowUpRight className="text-red-400 w-6 h-6" />}
      </div>
      <span className="font-semibold text-white">{isDeposit ? 'Dépôt' : 'Retrait'}</span>
    </button>
  );
};

export default ActionCard;
