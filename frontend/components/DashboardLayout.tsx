import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Landmark,
  Gift,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

interface Props {
  user: User | null;
  setUser: (u: User | null) => void;
}

const navItems = [
  { to: '/app/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/app/scalping', label: 'Scalping 48h', icon: Zap },
  { to: '/app/loans', label: 'Prêts bancaires', icon: Landmark },
  { to: '/app/grants', label: 'Subventions', icon: Gift },
  { to: '/app/profile', label: 'Mon profil', icon: UserCircle },
];

const DashboardLayout: React.FC<Props> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loadedUser, setLoadedUser] = useState<User | null>(user);

  useEffect(() => {
    if (loadedUser) return;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    api.get('/me')
      .then((r) => {
        setLoadedUser(r.data);
        setUser(r.data);
        if (r.data.role === 'admin') {
          navigate('/admin');
        }
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

  if (!loadedUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Mobile top bar */}
      <header className="md:hidden bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="NovaTrust" className="w-8 h-8" />
          <span className="font-bold text-lg">NovaTrust</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-700">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="md:flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? 'block' : 'hidden'
          } md:block md:w-64 bg-slate-800 border-r border-slate-700 md:min-h-screen p-4 md:sticky md:top-0`}
        >
          <div className="hidden md:flex items-center gap-2 mb-8 px-2">
            <img src="/logo.png" alt="NovaTrust" className="w-10 h-10" />
            <span className="font-bold text-xl">NovaTrust</span>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 mb-6 border border-slate-700">
            <p className="text-xs text-slate-400">Connecté en tant que</p>
            <p className="text-sm font-semibold text-white truncate">
              {loadedUser.name || loadedUser.phone}
            </p>
            <div className="mt-2">
              {loadedUser.activated ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                  <ShieldCheck className="w-3 h-3" />
                  Compte activé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400 text-xs">
                  Compte non activé
                </span>
              )}
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
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

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl">
          <Outlet context={{ user: loadedUser, setUser: setLoadedUser, refreshUser: () => api.get('/me').then(r => { setLoadedUser(r.data); setUser(r.data); }) }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
