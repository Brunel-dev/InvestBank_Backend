import React from 'react';
import { Card, Input, Button } from './ui';

interface DepositModalProps {
  depositAmount: string;
  setDepositAmount: (val: string) => void;
  isProcessing: boolean;
  setActiveModal: (val: string) => void;
  processDeposit: () => void;
  ownerPhoneNumber: string;
}

const DepositModal: React.FC<DepositModalProps> = ({
  depositAmount,
  setDepositAmount,
  isProcessing,
  setActiveModal,
  processDeposit,
  ownerPhoneNumber
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
      <h3 className="text-xl font-bold text-white mb-4">Effectuer un Dépôt</h3>
      <p className="text-slate-400 text-sm mb-6">
        Pour créditer votre compte, veuillez envoyer le montant souhaité par Mobile Money au numéro ci-dessous.
      </p>
      
      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6 text-center">
        <p className="text-xs text-blue-300 uppercase tracking-wide mb-1">Numéro Agent</p>
        <p className="text-2xl font-mono text-white font-bold tracking-wider select-all">{ownerPhoneNumber}</p>
        <p className="text-xs text-slate-500 mt-2">Nom: Service NovaTrust</p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-slate-300">Montant transféré (XAF)</label>
        <Input 
          type="number" 
          placeholder="Ex: 5000" 
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={() => setActiveModal('NONE')} className="w-1/3">
            Annuler
          </Button>
          <Button 
              className="w-2/3" 
              onClick={processDeposit}
              isLoading={isProcessing}
              disabled={!depositAmount}
          >
            J'ai effectué le dépôt
          </Button>
        </div>
      </div>
    </Card>
  </div>
);

export default DepositModal;
