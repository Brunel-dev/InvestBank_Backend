import React from 'react';
import { Card, Button } from './ui';
import { Lock } from 'lucide-react';

interface ActivationModalProps {
  isProcessing: boolean;
  setActiveModal: (val: string) => void;
  processActivation: () => void;
  ownerPhoneNumber: string;
  ACTIVATION_FEE: number;
}

const ActivationModal: React.FC<ActivationModalProps> = ({
  isProcessing,
  setActiveModal,
  processActivation,
  ownerPhoneNumber,
  ACTIVATION_FEE
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <Card className="w-full max-w-md border-red-500/50 animate-in fade-in zoom-in duration-200">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white">Compte Non Activé</h3>
        <p className="text-slate-300 text-sm mt-2">
          Pour effectuer des retraits, votre compte NovaTrust doit être activé pour des raisons de sécurité.
        </p>
      </div>

      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-6">
         <div className="flex justify-between items-center mb-2">
           <span className="text-slate-400">Frais d'activation:</span>
           <span className="text-red-400 font-bold text-lg">{ACTIVATION_FEE.toLocaleString()} XAF</span>
         </div>
         <div className="h-px bg-slate-700 my-2"></div>
         <p className="text-xs text-slate-500 text-center">
           Veuillez envoyer cette somme au numéro de trésorerie ci-dessous pour débloquer vos retraits instantanément.
         </p>
      </div>

      <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg mb-6 text-center">
        <p className="text-xl font-mono text-white font-bold select-all">{ownerPhoneNumber}</p>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setActiveModal('NONE')} className="w-1/3">
          Plus tard
        </Button>
        <Button 
          variant="danger"
          className="w-2/3" 
          onClick={processActivation}
          isLoading={isProcessing}
        >
          Payer l'activation
        </Button>
      </div>
    </Card>
  </div>
);

export default ActivationModal;
