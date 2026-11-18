import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { transactionService } from '../services';
import { Card, Button, Input, EmptyState } from '../components/common';
import toast from 'react-hot-toast';
import { formatCurrency, validateEmail, validateAmount } from '../utils/helpers';
import { Send, ArrowRight } from 'lucide-react';

export function TransferPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ receiverEmail: '', amount: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.receiverEmail) {
      newErrors.receiverEmail = 'Receiver email is required';
    } else if (!validateEmail(formData.receiverEmail)) {
      newErrors.receiverEmail = 'Invalid email format';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > 999999.99) {
      newErrors.amount = 'Amount exceeds maximum limit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await transactionService.transfer({
        receiverEmail: formData.receiverEmail,
        amount: parseFloat(formData.amount),
      });

      setSuccess(response.data.data);
      setFormData({ receiverEmail: '', amount: '' });
      toast.success('Transfer successful!');

      setTimeout(() => {
        window.dispatchEvent(new Event('refreshTransactions'));
        window.dispatchEvent(new Event('refreshProfile'));
        window.dispatchEvent(new Event('refreshDashboard'));
        window.dispatchEvent(new Event('refreshAdminData'));
      }, 500);

      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Send Money</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transfer funds securely to another account
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transfer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  From Account
                </label>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.fullName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {formatCurrency(user?.balance)}
                  </p>
                </div>
              </div>

              <Input
                label="Recipient Email"
                type="email"
                placeholder="recipient@example.com"
                value={formData.receiverEmail}
                onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                error={errors.receiverEmail}
              />

              <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={errors.amount}
              />

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total to transfer</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(formData.amount || 0)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                <Send size={20} />
                Send Money
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Success Message & Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {success && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
              <div className="text-center">
                <span className="text-5xl mb-4 block">✅</span>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">Transfer Successful!</h3>
                <p className="text-green-600 dark:text-green-400 mb-4">
                  {formatCurrency(success.amount)} has been sent successfully
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Transaction ID: {success.transactionId}
                </p>
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Transfer Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-3">
                <span className="text-blue-600">✓</span>
                <span>Double-check the recipient email before sending</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600">✓</span>
                <span>Transfers are completed instantly</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600">✓</span>
                <span>You can track all transfers in your history</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600">✓</span>
                <span>All transactions are secure and encrypted</span>
              </li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Limits</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Max per transfer:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">$999,999.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transfers today:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Unlimited</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
