import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/helpers';
import { TrendingUp, TrendingDown, Send, History } from 'lucide-react';

export function BalanceCard({ balance, accountNumber }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl"
    >
      <div className="flex justify-between items-start mb-12">
        <div>
          <p className="text-blue-100 text-sm font-semibold mb-2">CURRENT BALANCE</p>
          <h2 className="text-4xl font-bold">{formatCurrency(balance)}</h2>
        </div>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
          <span className="text-3xl">💳</span>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-blue-100 text-xs uppercase tracking-widest mb-1">Account Number</p>
          <p className="text-xl font-mono font-bold">****{accountNumber?.slice(-4) || '****'}</p>
        </div>
        <span className="text-xs text-blue-100">VALID</span>
      </div>
    </motion.div>
  );
}

export function AnalyticsCard({ title, value, icon, color = 'blue', trend = 0 }) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <span className={`p-3 rounded-lg ${colors[color]}`}>{icon}</span>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
    </motion.div>
  );
}

export function QuickActionsCard() {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <a
          href="/transfer"
          className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
        >
          <Send size={20} />
          <span className="font-semibold">Send Money</span>
        </a>
        <a
          href="/transactions"
          className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
        >
          <History size={20} />
          <span className="font-semibold">View History</span>
        </a>
      </div>
    </motion.div>
  );
}
