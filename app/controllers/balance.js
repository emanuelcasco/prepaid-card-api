const edenredService = require('../services/edenred');
const logger = require('../logger');
const subscribers = require('../subscribers');

const { formatCurrency } = require('../utils');
const { CURRENCY_PRICE_NAMESPACE, DEFAULT_CURRENCY } = require('../constants');
const { events: balanceEvents } = require('../subscribers/subscriptions/balance');

const getBalanceByCurrency = prices => edenredBalance => {
  const balance = Object.keys(prices).reduce(
    (accum, key) => ({ ...accum, [key]: formatCurrency(edenredBalance / prices[key]) }),
    { [DEFAULT_CURRENCY]: formatCurrency(edenredBalance) }
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
