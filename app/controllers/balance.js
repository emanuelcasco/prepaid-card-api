const edenredService = require('../services/edenred');
const logger = require('../logger');
const subscribers = require('../subscribers');

const { formatCurrency } = require('../utils');
const { CURRENCY_PRICE_NAMESPACE, CURRENCY_BASE, CURRENCY_SOURCE } = require('../constants');
const { events: balanceEvents } = require('../subscribers/subscriptions/balance');

const getBalanceByCurrency = prices => edenredBalance => {
  const sourceCurrencyBalancce = edenredBalance / prices[CURRENCY_BASE];

  const balance = Object.keys(prices).reduce(
    (accum, key) => ({ ...accum, [key]: formatCurrency(sourceCurrencyBalancce * prices[key]) }),
    { [CURRENCY_SOURCE]: formatCurrency(sourceCurrencyBalancce) }
  );
  return { balance, prices };
};

exports.getBalanceByCardNumber = (req, res, next) => {
  const { cardNumber } = req.params;
  const prices = res[CURRENCY_PRICE_NAMESPACE];

  return edenredService
    .getBalanceByCardNumber(cardNumber)
    .then(getBalanceByCurrency(prices))
    .then(fullBalance => {
      subscribers.publish(balanceEvents.balanceFetched, fullBalance);
      logger.info('Balance retrieved correctly!');
      return res.status(200).send(fullBalance);
    })
    .catch(next);
};
