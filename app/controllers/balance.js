const edenredService = require('../services/edenred');
const { CURRENCY_PRICE_NAMESPACE, DEFAULT_CURRENCY } = require('../constants');

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const getBalanceByCurrency = prices => edenredBalance => {
  const balance = Object.keys(prices).reduce(
    (accum, key) => ({ ...accum, [key]: formatter.format(edenredBalance / prices[key]) }),
    { [DEFAULT_CURRENCY]: formatter.format(edenredBalance) }
  );
  return { balance, prices };
};

exports.getBalanceByCardNumber = (req, res, next) => {
  const { cardNumber } = req.params;
  const prices = res[CURRENCY_PRICE_NAMESPACE];

  return edenredService
    .getBalanceByCardNumber(cardNumber)
    .then(getBalanceByCurrency(prices))
    .then(fullBalance => res.json(fullBalance))
    .catch(next);
};
