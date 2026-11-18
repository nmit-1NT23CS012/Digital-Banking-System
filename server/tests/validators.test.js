const assert = require('assert');
const { formatCents, parseAmountToCents, validateAmount } = require('../utils/validators');

assert.strictEqual(parseAmountToCents(12.34), 1234);
assert.strictEqual(parseAmountToCents('12.3'), 1230);
assert.strictEqual(parseAmountToCents('999999.99'), 99999999);
assert.strictEqual(formatCents(1234), '12.34');

for (const amount of ['1e2', '12.345', '12abc', ' 12.00', '-1', NaN, Infinity, {}, null]) {
  assert.strictEqual(parseAmountToCents(amount), null, `Expected ${String(amount)} to be rejected`);
  assert.strictEqual(validateAmount(amount), false, `Expected ${String(amount)} to be invalid`);
}

assert.strictEqual(parseAmountToCents(0), 0);
assert.strictEqual(validateAmount(0), false);
assert.strictEqual(validateAmount('0.01'), true);
assert.strictEqual(validateAmount('1000000.00'), false);

console.log('Amount validation tests passed');
