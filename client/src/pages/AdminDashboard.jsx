import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services';
import { UsersList, TransactionsList } from '../components/admin';
import { Card, SkeletonLoader, Button, Input } from '../components/common';
import { AnalyticsCard } from '../components/dashboard';
import { Users, Activity, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [addFundsUserId, setAddFundsUserId] = useState('');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [addFundsLoading, setAddFundsLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const results = await Promise.allSettled([
        adminService.getAllUsers(),
        adminService.getStats(),
        adminService.getTransactions(1, 10),
      ]);

      if (results[0].status === 'fulfilled') {
        const userData = results[0].value.data.data?.users || results[0].value.data.users || [];
        setUsers(userData);
        console.log('Users loaded:', userData.length);
      } else {
        toast.error('Failed to fetch users: ' + (results[0].reason?.response?.data?.message || results[0].reason?.message));
        console.error('Users fetch error:', results[0].reason);
        setUsers([]);
      }

      if (results[1].status === 'fulfilled') {
        const statsData = results[1].value.data.data || {};
        setStats(statsData);
        console.log('Stats loaded:', statsData);
      } else {
        console.error('Stats fetch error:', results[1].reason);
        setStats({});
      }

      if (results[2].status === 'fulfilled') {
        const txnData = results[2].value.data.data?.transactions || results[2].value.data.transactions || [];
        setTransactions(txnData);
        console.log('Transactions loaded:', txnData.length);
      } else {
        console.error('Transactions fetch error:', results[2].reason);
        setTransactions([]);
      }
    } catch (error) {
      toast.error('Failed to fetch admin data: ' + error.message);
      console.error('Admin data fetch error:', error);
      setUsers([]);
      setStats({});
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }

    const handleRefresh = () => {
      if (user?.role === 'admin') {
        setLoading(true);
        fetchAdminData();
      }
    };

    window.addEventListener('refreshAdminData', handleRefresh);
    return () => window.removeEventListener('refreshAdminData', handleRefresh);
  }, [user]);

  const handleFreeze = async (id) => {
    try {
      await adminService.freezeAccount(id);
      setUsers(users.map((u) => (u.id === id ? { ...u, isFrozen: true } : u)));
      toast.success('Account frozen');
      window.dispatchEvent(new Event('refreshAdminData'));
    } catch (error) {
      toast.error('Failed to freeze account');
    }
  };

  const handleUnfreeze = async (id) => {
    try {
      await adminService.unfreezeAccount(id);
      setUsers(users.map((u) => (u.id === id ? { ...u, isFrozen: false } : u)));
      toast.success('Account unfrozen');
      window.dispatchEvent(new Event('refreshAdminData'));
    } catch (error) {
      toast.error('Failed to unfreeze account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminService.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success('User deleted');
      window.dispatchEvent(new Event('refreshAdminData'));
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleAddFundsSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(addFundsAmount);
    if (!addFundsUserId) {
      toast.error('Please select a user');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount greater than 0');
      return;
    }

    setAddFundsLoading(true);
    try {
      const response = await adminService.addFunds(addFundsUserId, amount);
      setUsers(users.map((u) => (u.id === addFundsUserId ? { ...u, balance: Number(u.balance) + amount } : u)));
      toast.success(response.data.data?.message || `Added $${amount.toFixed(2)} successfully`);
      setAddFundsUserId('');
      setAddFundsAmount('');

      // Dispatch refresh events to update other pages
      setTimeout(() => {
        window.dispatchEvent(new Event('refreshAdminData'));
        window.dispatchEvent(new Event('refreshDashboard'));
        window.dispatchEvent(new Event('refreshTransactions'));
        window.dispatchEvent(new Event('refreshProfile'));
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add funds');
    } finally {
      setAddFundsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user?.role || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <p className="text-red-700 dark:text-red-300 font-semibold">Access Denied: Admin privileges required</p>
          <p className="text-red-600 dark:text-red-400 mt-2">Please log out and log back in to refresh your permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage users, transactions, and system settings</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <AnalyticsCard
          title="Total Users"
          value={users.length}
          icon={<Users size={24} />}
          color="blue"
        />
        <AnalyticsCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={<Activity size={24} />}
          color="green"
        />
        <AnalyticsCard
          title="Total Transferred"
          value={`$${(stats.totalTransferred || 0).toFixed(2)}`}
          icon={<DollarSign size={24} />}
          color="purple"
        />
        <AnalyticsCard
          title="Avg Transaction"
          value={`$${(stats.averageTransactionAmount || 0).toFixed(2)}`}
          icon={<TrendingUp size={24} />}
          color="blue"
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users Management' },
          { id: 'transactions', label: 'All Transactions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {activeTab === 'overview' && (
          <>
            <Card className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h3>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                    <li className="flex justify-between">
                      <span>Active Users:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {users.filter((u) => !u.isFrozen).length}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Frozen Accounts:</span>
                      <span className="font-bold text-red-600">
                        {users.filter((u) => u.isFrozen).length}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Total Accounts:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{users.length}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Server Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">Online</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Database Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Add Funds to User Account</h2>
              <form onSubmit={handleAddFundsSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select User</label>
                  <select
                    value={addFundsUserId}
                    onChange={(e) => setAddFundsUserId(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Choose a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                  <Input
                    type="number"
                    placeholder="100.00"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Button type="submit" variant="primary" loading={addFundsLoading} className="w-full">
                    Add Funds
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}

        {activeTab === 'users' && (
          <UsersList
            users={users}
            onFreeze={handleFreeze}
            onUnfreeze={handleUnfreeze}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsList transactions={transactions} loading={false} />
        )}
      </motion.div>
    </div>
  );
}
