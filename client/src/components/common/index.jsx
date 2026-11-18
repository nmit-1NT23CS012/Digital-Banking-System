import { motion } from 'framer-motion';

export function Button({ children, variant = 'primary', size = 'md', disabled = false, loading = false, onClick, className = '' }) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105',
    secondary: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <span className="spinner" />}
      {children}
    </motion.button>
  );
}

export function Input({ label, type = 'text', placeholder, value, onChange, error, disabled = false, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner h-12 w-12" />
    </div>
  );
}

export function TransactionCard({ transaction, currentUserId }) {
  const isSent = transaction.sender_id === currentUserId;
  
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="card flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSent ? 'bg-red-100' : 'bg-green-100'}`}>
          <span className={`text-xl ${isSent ? 'text-red-500' : 'text-green-500'}`}>
            {isSent ? '↑' : '↓'}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {isSent ? transaction.otherUserName || 'Unknown' : transaction.otherUserName || 'Unknown'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(transaction.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className={`font-bold text-lg ${isSent ? 'text-red-500' : 'text-green-500'}`}>
        {isSent ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
      </p>
    </motion.div>
  );
}

export function SkeletonLoader({ count = 3 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-lg mb-4" />
      ))}
    </>
  );
}

export function EmptyState({ message = 'No data available', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <p className="text-gray-500 dark:text-gray-400 text-lg">{message}</p>
    </div>
  );
}
