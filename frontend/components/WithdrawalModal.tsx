import React from 'react';
import { Card, Button } from './ui';
import { Phone, ArrowUpRight, X, ShieldCheck, Lock } from 'lucide-react';
import { buildWhatsAppLink } from '../services/api';

interface Props {
  open: boolean;
  onClose: () => void;
  balance: number;
  activated: boolean;
}

const WithdrawalModal: React.FC<Props> = ({ open, onClose, balance, activated }) => {
  if (!open) return null;

  const message =
    `Bonjour, je souhaite effectuer un retrait depuis mon compte NovaTrust vers mon compte Mobile Money. ` +
    `Solde actuel : ${balance.toLocaleString('fr-FR')} XAF. ` +
    `Merci de m'assister pour la transaction.`;

  const openWa = () => {
    window.open(buildWhatsAppLink(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-500/40 relative my-4 sm:my-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <ArrowUpRight className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Demande de retrait</h3>
          <p className="text-slate-300 text-sm mt-2">
            Pour transférer des fonds de votre compte NovaTrust vers votre compte Mobile Money,
            veuillez vous faire accompagner par votre agent dédié.
          </p>
        </div>

        {!activated ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 flex gap-3">
            <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">
              Votre compte n'est pas encore activé. L'activation est requise pour traiter un retrait.
              Contactez l'agent ci-dessous pour finaliser l'activation et procéder au retrait.
            </p>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-200">
              <p className="font-semibold text-emerald-300 mb-1">Procédure sécurisée</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Cliquez sur le bouton WhatsApp ci-dessous.</li>
                <li>Indiquez à l'agent le montant souhaité et votre numéro Mobile Money.</li>
                <li>L'agent valide la transaction et débite votre solde NovaTrust.</li>
                <li>Vous recevez les fonds sur votre compte Mobile Money.</li>
              </ol>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-6 text-center">
          <p className="text-xs text-slate-400">Solde disponible</p>
          <p className="text-2xl font-bold text-white">
            {balance.toLocaleString('fr-FR')} <span className="text-blue-400 text-base">XAF</span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="success" onClick={openWa} className="flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" />
            Contacter l'agent sur WhatsApp
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default WithdrawalModal;
