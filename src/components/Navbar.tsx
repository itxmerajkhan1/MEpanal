import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Home, ShoppingBag, List, LogOut, Zap, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../context/UserContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const { userData } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 dark:bg-gray-900/40 backdrop-blur-xl border border-white/10 dark:border-gray-800/50 rounded-2xl px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/50">
            <span className="text-white font-black text-lg leading-none">SMM</span>
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent tracking-tighter drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            SMM PANEL
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/services", icon: ShoppingBag, label: "Services" },
            { to: "/orders", icon: List, label: "Orders" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 font-medium transition-all group relative py-2"
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
            </Link>
          ))}
          {userData?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 font-medium transition-all group relative py-2"
            >
              <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Admin</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
