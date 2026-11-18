import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { transactionService } from '../services';
import { Card, SkeletonLoader, EmptyState, TransactionCard } from '../components/common';
import { Search, Filter } from 'lucide-react';

export function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getHistory(page, 10);
      const txnData = response.data.data?.transactions || response.data.transactions || [];
      const pagination = response.data.data?.pagination || { pages: 1 };
      setTransactions(txnData);
      setTotalPages(pagination.pages);
      console.log('Transactions fetched:', txnData.length);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  useEffect(() => {
    const handleRefresh = () => {
      setPage(1);
      fetchTransactions();
    };

    window.addEventListener('refreshTransactions', handleRefresh);
    return () => window.removeEventListener('refreshTransactions', handleRefresh);
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = 
      txn.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.otherUserEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      (filterType === 'sent' && txn.sender_id === user?.id) ||
      (filterType === 'received' && txn.receiver_id === user?.id);

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Transaction History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all your transactions
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {loading ? (
          <SkeletonLoader count={5} />
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((txn) => (
              <TransactionCard key={txn.id} transaction={txn} currentUserId={user?.id} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState message="No transactions found" icon="🔍" />
          </Card>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center gap-4 mt-8"
        >
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  page === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </motion.div>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-700 dark:text-yellow-300">Profile data not loaded. Please try refreshing the page or logging out and back in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8"
      >
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user?.fullName?.split(' ').map((word) => word[0]).join('') || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.fullName || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email || 'No email'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Account Number</p>
            <p className="text-xl font-mono font-bold text-gray-900 dark:text-gray-100">
              ****{user?.accountNumber?.slice(-4)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Account Balance</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              ${Number(user?.balance || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Account Type</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {user?.role || 'User'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Account Status</p>
            <p className={`text-xl font-bold ${user?.isFrozen ? 'text-red-600' : 'text-green-600'}`}>
              {user?.isFrozen ? 'Frozen' : 'Active'}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-4">Account Information</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>✓ Two-factor authentication available</li>
            <li>✓ Secure SSL encryption</li>
            <li>✓ 24/7 account monitoring</li>
            <li>✓ FDIC Insured</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
