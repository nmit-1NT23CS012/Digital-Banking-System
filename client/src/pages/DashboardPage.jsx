import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { transactionService } from '../services';
import { BalanceCard, AnalyticsCard, QuickActionsCard } from '../components/dashboard';
import { Card, EmptyState, SkeletonLoader, TransactionCard } from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, Send, DollarSign, History } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTransactions: 0, totalTransferred: 0, averageTransaction: 0 });

  const fetchData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        transactionService.getBalance(),
        transactionService.getHistory(1, 5),
      ]);

      setBalance(balanceRes.data.data);
      setTransactions(historyRes.data.data?.transactions || historyRes.data.transactions || []);

      // Calculate stats
      const total = historyRes.data.data?.transactions.length || historyRes.data.transactions.length || 0;
      const sum = (historyRes.data.data?.transactions || historyRes.data.transactions || []).reduce(
        (acc, txn) => acc + Number(txn.amount),
        0
      );
      setStats({
        totalTransactions: total,
        totalTransferred: sum,
        averageTransaction: total > 0 ? (sum / total).toFixed(2) : 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRefresh = () => {
      setLoading(true);
      fetchData();
    };

    window.addEventListener('refreshDashboard', handleRefresh);
    return () => window.removeEventListener('refreshDashboard', handleRefresh);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SkeletonLoader count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your accounts and transactions securely
        </p>
      </motion.div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        {balance && <BalanceCard balance={balance.balance} accountNumber={balance.accountNumber} />}
      </motion.div>

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <AnalyticsCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={<History size={24} />}
          color="blue"
        />
        <AnalyticsCard
          title="Total Transferred"
          value={formatCurrency(stats.totalTransferred)}
          icon={<Send size={24} />}
          color="green"
          trend={12}
        />
        <AnalyticsCard
          title="Avg. Transaction"
          value={formatCurrency(stats.averageTransaction)}
          icon={<DollarSign size={24} />}
          color="purple"
        />
        <AnalyticsCard
          title="Account Growth"
          value="+2.5%"
          icon={<TrendingUp size={24} />}
          color="blue"
          trend={5}
        />
      </motion.div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Transactions</h2>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <TransactionCard key={txn.id} transaction={txn} currentUserId={user?.id} />
                ))}
              </div>
            ) : (
              <EmptyState message="No transactions yet" icon="📝" />
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <QuickActionsCard />
        </motion.div>
      </div>
    </div>
  );
}
