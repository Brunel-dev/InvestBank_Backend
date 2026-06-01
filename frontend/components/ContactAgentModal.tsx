import React from 'react';
import { Card, Button } from './ui';
import { Phone, MessageCircle, X } from 'lucide-react';
import { buildWhatsAppLink } from '../services/api';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  defaultMessage?: string;
}

const ContactAgentModal: React.FC<Props> = ({
  open,
  onClose,
  title = 'Effectuer un dépôt',
  message = "Pour créditer votre compte, veuillez contacter notre agent qui vous prendra en charge personnellement.",
  defaultMessage = "Bonjour, je souhaite effectuer un dépôt sur mon compte NovaTrust.",
}) => {
  if (!open) return null;

  const openWa = () => {
    window.open(buildWhatsAppLink(defaultMessage), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4">
      <Card className="w-full max-w-md border-emerald-500/40 relative my-4 sm:my-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-slate-300 text-sm mt-2">{message}</p>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg mb-6 text-sm text-slate-200">
          <p className="font-semibold text-emerald-300 mb-1">Comment ça marche ?</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Cliquez sur le bouton WhatsApp ci-dessous</li>
            <li>Un agent vous expliquera la procédure</li>
            <li>Une fois le paiement reçu, votre solde sera crédité</li>
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="success" onClick={openWa} className="flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" />
            Contacter l'agent sur WhatsApp
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Plus tard
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default ContactAgentModal;
