import React, { useEffect, useState } from 'react';
import { Card, Button } from '../ui';
import api from '../../services/api';

interface Grant {
  id: number;
  project_title: string;
  category: string;
  description: string;
  requested_amount_cfa: number;
  full_name: string;
  phone: string;
  status: string;
  id_document_path: string | null;
  created_at: string;
}

const AdminGrants: React.FC = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/grants')
      .then((r) => setGrants(r.data.data || r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (g: Grant, status: string) => {
    const note = prompt('Note (optionnel) :', '') || '';
    try {
      await api.post(`/admin/grants/${g.id}/status`, { status, admin_note: note });
      setGrants((gs) => gs.map((x) => (x.id === g.id ? { ...x, status } : x)));
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
      <h1 className="text-2xl md:text-3xl font-bold">Demandes de subventions</h1>

      <Card>
        {loading ? (
          <p className="text-slate-400 text-center py-8">Chargement...</p>
        ) : grants.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Aucune demande.</p>
        ) : (
          <ul className="space-y-3">
            {grants.map((g) => (
              <li key={g.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[260px]">
                    <p className="font-semibold text-white">{g.project_title}</p>
                    <p className="text-xs text-pink-300">{g.category} — {g.requested_amount_cfa.toLocaleString('fr-FR')} XAF</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Par {g.full_name} ({g.phone})
                    </p>
                    <p className="text-sm text-slate-300 mt-2 line-clamp-3">{g.description}</p>
                    {g.id_document_path && (
                      <a
                        href={publicUrl(g.id_document_path)!}
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
                        g.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : g.status === 'rejected'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {g.status}
                    </span>
                    {g.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="success" className="w-auto px-3 py-1.5 text-xs" onClick={() => updateStatus(g, 'approved')}>
                          Approuver
                        </Button>
                        <Button variant="danger" className="w-auto px-3 py-1.5 text-xs" onClick={() => updateStatus(g, 'rejected')}>
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

export default AdminGrants;
