import React, { useEffect, useState } from 'react';
import { Card, Button, Input } from '../ui';
import { Plus, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

const AdminAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const loadAdmins = () => {
    setLoading(true);
    api
      .get('/admin/admins')
      .then((r) => setAdmins(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Erreur'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Le nom est requis');
      return false;
    }
    if (!form.email.trim()) {
      setFormError('L\'email est requis');
      return false;
    }
    if (!form.email.includes('@')) {
      setFormError('Email invalide');
      return false;
    }
    if (!form.phone.trim()) {
      setFormError('Le téléphone est requis');
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setFormError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (form.password !== form.password_confirmation) {
      setFormError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/admin/admins', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // Ajouter le nouvel admin à la liste
      setAdmins((prev) => [response.data.user, ...prev]);

      // Réinitialiser le formulaire
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
      });
      setShowModal(false);
      setFormError(null);
    } catch (e: any) {
      const message = e.response?.data?.message || e.response?.data?.errors?.email?.[0] || 'Erreur lors de la création';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setFormError(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Gestion des Admins</h1>
        <Button
          onClick={openModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Créer un admin
        </Button>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-500/50 p-4">
          <p className="text-red-200">{error}</p>
        </Card>
      )}

      {loading ? (
        <Card className="p-8 text-center text-slate-400">Chargement...</Card>
      ) : admins.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">Aucun admin trouvé</Card>
      ) : (
        <div className="grid gap-4">
          {admins.map((admin) => (
            <Card key={admin.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{admin.name}</h3>
                <p className="text-slate-400 text-sm">{admin.email}</p>
                <p className="text-slate-400 text-sm">{admin.phone}</p>
                <p className="text-slate-500 text-xs mt-2">
                  Créé le {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold">Créer un nouvel admin</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitForm} className="p-4 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{formError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <Input
                  name="name"
                  placeholder="Nom complet"
                  value={form.name}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Téléphone *</label>
                <Input
                  name="phone"
                  placeholder="+237 xxx xxx xxx"
                  value={form.phone}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={form.password}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirmer le mot de passe *</label>
                <Input
                  name="password_confirmation"
                  type="password"
                  placeholder="Confirmez le mot de passe"
                  value={form.password_confirmation}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAdmins;
