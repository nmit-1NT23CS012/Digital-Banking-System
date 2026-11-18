import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Lock, Unlock } from 'lucide-react';

export function UsersList({ users, onFreeze, onUnfreeze, onDelete }) {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(users.map((u) => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Balance</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <motion.tr
                key={user.id}
                whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user.fullName}</p>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 font-mono text-gray-900 dark:text-gray-100">${Number(user.balance).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.isFrozen
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {user.isFrozen ? 'Frozen' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.isFrozen ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => onUnfreeze(user.id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Unfreeze"
                      >
                        <Unlock size={18} />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => onFreeze(user.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title="Freeze"
                      >
                        <Lock size={18} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => onAddFunds(user.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Add Funds"
                    >
                      +
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => onDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TransactionsList({ transactions, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">From</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">To</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{txn.senderName}</td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{txn.receiverName}</td>
                <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">${Number(txn.amount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {txn.transaction_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(txn.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
