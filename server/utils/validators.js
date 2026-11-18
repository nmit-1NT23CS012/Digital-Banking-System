const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

const parseAmountToCents = (amount) => {
  if (typeof amount !== 'number' && typeof amount !== 'string') {
    return null;
  }

  const value = typeof amount === 'number' && Number.isFinite(amount) ? String(amount) : amount;
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const [whole, fraction = ''] = value.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
};

const formatCents = (cents) => {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');
  return `${whole}.${fraction}`;
};

const validateAmount = (amount) => {
  const cents = parseAmountToCents(amount);
  return cents !== null && cents > 0 && cents <= 99999999;
};

const validateAccountNumber = (accountNumber) => {
  return /^\d{10}$/.test(accountNumber);
};

module.exports = {
  validateEmail,
  validatePassword,
  parseAmountToCents,
  formatCents,
  validateAmount,
  validateAccountNumber,
};
