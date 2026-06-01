import React, { useEffect, useState } from 'react';
import { Card, Button } from '../ui';
import api from '../../services/api';

interface Loan {
  id: number;
  full_name: string;
  phone: string;
  amount_cfa: number;
  duration_months: number;
  monthly_payment_cfa: number;
  purpose: string;
  status: string;
  id_document_path: string | null;
  created_at: string;
  user?: { id: number; name: string | null; phone: string };
}

const AdminLoans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/loans')
      .then((r) => setLoans(r.data.data || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (loan: Loan, status: string) => {
    const note = prompt('Note (optionnel) :', '') || '';
    try {
      await api.post(`/admin/loans/${loan.id}/status`, { status, admin_note: note });
      setLoans((ls) => ls.map((l) => (l.id === loan.id ? { ...l, status } : l)));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erreur');
    }
  };

  const publicUrl = (p: string | null) => {
    if (!p) return null;
    const base = (import.meta as any).env?.VITE_API_PUBLIC_URL || 'http://127.0.0.1:8000';
    return `${base}/storage/${p}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Demandes de prêts</h1>

      <Card>
        {loading ? (
          <p className="text-slate-400 text-center py-8">Chargement...</p>
        ) : loans.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Aucune demande.</p>
        ) : (
          <ul className="space-y-3">
            {loans.map((l) => (
              <li key={l.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {l.full_name}{' '}
                      <span className="text-slate-500 text-xs">({l.phone})</span>
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      {l.amount_cfa.toLocaleString('fr-FR')} XAF sur {l.duration_months} mois — mensualité {l.monthly_payment_cfa.toLocaleString('fr-FR')} XAF
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Objet : {l.purpose}</p>
                    {l.id_document_path && (
                      <a
                        href={publicUrl(l.id_document_path)!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 underline mt-1 inline-block"
                      >
                        Voir la pièce d'identité
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        l.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : l.status === 'rejected'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {l.status}
                    </span>
                    {l.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="success" className="w-auto px-3 py-1.5 text-xs" onClick={() => updateStatus(l, 'approved')}>
                          Approuver
                        </Button>
                        <Button variant="danger" className="w-auto px-3 py-1.5 text-xs" onClick={() => updateStatus(l, 'rejected')}>
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default AdminLoans;
