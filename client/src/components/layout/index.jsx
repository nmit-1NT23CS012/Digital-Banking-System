import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '../common';

export function Header() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              BankPro
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <span className="text-gray-700 dark:text-gray-300">Welcome, {user.fullName}</span>
                <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 flex flex-col gap-4"
            >
              {user && (
                <>
                  <span className="text-gray-700 dark:text-gray-300 px-4">{user.fullName}</span>
                  <button onClick={toggleTheme} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const menuItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Transfer Money', href: '/transfer', icon: '💸' },
    { label: 'Transactions', href: '/transactions', icon: '📋' },
    { label: 'Profile', href: '/profile', icon: '👤' },
    ...(user?.role === 'admin' ? [{ label: 'Admin Panel', href: '/admin', icon: '🔐' }] : []),
  ];

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform z-40`}
    >
      <nav className="p-6 flex flex-col gap-4">
        {menuItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </motion.aside>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              BankPro
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Secure digital banking platform for modern financial needs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600">Features</a></li>
              <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-600">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600">About</a></li>
              <li><a href="#" className="hover:text-blue-600">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
              <li><a href="#" className="hover:text-blue-600">Terms</a></li>
              <li><a href="#" className="hover:text-blue-600">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} BankPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
