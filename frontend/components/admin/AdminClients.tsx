import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '../ui';
import { Search, Plus, Minus, ShieldCheck, ShieldOff, X } from 'lucide-react';
import api from '../../services/api';

interface Client {
  id: number;
  name: string | null;
  phone: string;
  activated: boolean;
  balance: number;
  created_at: string;
}

const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ client: Client; mode: 'credit' | 'debit' } | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = (q = '') => {
    setLoading(true);
    api.get('/admin/clients', { params: q ? { search: q } : {} })
      .then((r) => setClients(r.data.data || r.data))
      .catch((e) => setError(e.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const openAdjust = (client: Client, mode: 'credit' | 'debit') => {
    setModal({ client, mode });
    setAmount('');
    setReason('');
  };

  const submitAdjust = async () => {
    if (!modal) return;
    const n = parseInt(amount);
    if (!n || n <= 0) {
      alert('Montant invalide');
      return;
    }
    if (!reason.trim()) {
      alert('Motif requis');
      return;
    }
    setSubmitting(true);
    try {
      const delta = modal.mode === 'credit' ? n : -n;
      const r = await api.post(`/admin/clients/${modal.client.id}/balance`, {
        delta_cfa: delta,
        reason: reason.trim(),
      });
      setClients((cs) =>
        cs.map((c) => (c.id === modal.client.id ? { ...c, balance: r.data.new_balance } : c))
      );
      setModal(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActivation = async (client: Client) => {
    if (!confirm(`${client.activated ? 'Désactiver' : 'Activer'} ce compte ?`)) return;
    try {
      const r = await api.post(`/admin/clients/${client.id}/toggle-activation`);
      setClients((cs) =>
        cs.map((c) => (c.id === client.id ? { ...c, activated: r.data.activated } : c))
      );
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Clients</h1>
        <form onSubmit={onSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="w-auto px-4">OK</Button>
        </form>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-slate-400 text-center py-8">Chargement...</p>
        ) : clients.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Aucun client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Nom</th>
                  <th className="py-3 px-2">Téléphone</th>
                  <th className="py-3 px-2 text-right">Solde</th>
                  <th className="py-3 px-2">Statut</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 px-2 text-slate-500">#{c.id}</td>
                    <td className="py-3 px-2 text-white">{c.name || '—'}</td>
                    <td className="py-3 px-2 font-mono text-slate-300">{c.phone}</td>
                    <td className="py-3 px-2 text-right font-semibold text-white">
                      {c.balance.toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-2">
                      {c.activated ? (
                        <span className="text-emerald-400 text-xs">Activé</span>
                      ) : (
                        <span className="text-amber-400 text-xs">Non activé</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openAdjust(c, 'credit')}
                          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          title="Créditer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openAdjust(c, 'debit')}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          title="Débiter"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActivation(c)}
                          className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                          title={c.activated ? 'Désactiver' : 'Activer'}
                        >
                          {c.activated ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
          <Card className={`w-full max-w-md relative my-4 sm:my-8 ${modal.mode === 'credit' ? 'border-emerald-500/40' : 'border-red-500/40'}`}>
            <button
              onClick={() => setModal(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">
              {modal.mode === 'credit' ? 'Créditer le solde' : 'Débiter le solde'}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Client : <span className="text-white">{modal.client.name || modal.client.phone}</span>
              <br />
              Solde actuel : <span className="text-white">{modal.client.balance.toLocaleString('fr-FR')} XAF</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Montant (XAF)</label>
                <Input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 50000"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Motif</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: confirmation de dépôt Mobile Money..."
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setModal(null)} className="w-1/3">
                  Annuler
                </Button>
                <Button
                  variant={modal.mode === 'credit' ? 'success' : 'danger'}
                  onClick={submitAdjust}
                  isLoading={submitting}
                  className="w-2/3"
                >
                  {modal.mode === 'credit' ? 'Créditer' : 'Débiter'}
                </Button>
              </div>
            </div>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
