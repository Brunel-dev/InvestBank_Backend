import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Landmark,
  Gift,
  BarChart3,
  LogOut,
  Menu,
  X,
  Activity,
  UserCircle,
} from 'lucide-react';
import api from '../../services/api';
import { User } from '../../types';

interface Props {
  user: User | null;
  setUser: (u: User | null) => void;
}

const navItems = [
  { to: '/admin', label: 'Vue d\'ensemble', icon: BarChart3, end: true },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/admins', label: 'Admins', icon: ShieldCheck },
  { to: '/admin/scalpings', label: 'Scalpings actifs', icon: Activity },
  { to: '/admin/loans', label: 'Demandes de prêts', icon: Landmark },
  { to: '/admin/grants', label: 'Subventions', icon: Gift },
  { to: '/admin/profile', label: 'Mon profil', icon: UserCircle },
];

const AdminLayout: React.FC<Props> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<User | null>(user);

  useEffect(() => {
    if (loaded?.role === 'admin') return;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    api.get('/me')
      .then((r) => {
        if (r.data.role !== 'admin') {
          navigate('/app/dashboard');
          return;
        }
        setLoaded(r.data);
        setUser(r.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  if (!loaded || loaded.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Vérification...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="md:hidden bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-lg">Admin</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-700">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="md:flex">
        <aside
          className={`${
            open ? 'block' : 'hidden'
          } md:block md:w-64 bg-slate-800 border-r border-slate-700 md:min-h-screen p-4 md:sticky md:top-0`}
        >
          <div className="hidden md:flex items-center gap-2 mb-8 px-2">
            <img src="/logo.png" alt="NovaTrust" className="w-10 h-10" />
            <div>
              <span className="font-bold text-lg block leading-tight">NovaTrust</span>
              <span className="text-xs text-blue-300">Administration</span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-red-300 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            Se déconnecter
          </button>
        </aside>

        <main className="flex-1 p-4 md:p-8 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
