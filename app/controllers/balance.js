const Cachify = require('../libs/cachify');
const edenredService = require('../services/edenred');
const logger = require('../logger');
// const subscribers = require('../subscribers');
const { balanceCacheTime, redisUrl } = require('../../config');

const { formatCurrency } = require('../utils');
// const { events: balanceEvents } = require('../subscribers/subscriptions/balance');

const {
  BALANCE_CACHE_KEY,
  CURRENCY_PRICE_NAMESPACE,
  CURRENCY_BASE,
  CURRENCY_SOURCE
} = require('../constants');

const cachify = new Cachify(redisUrl);

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
  const { force } = req.query;
  const prices = res[CURRENCY_PRICE_NAMESPACE];

  const KEY = `${BALANCE_CACHE_KEY}:${cardNumber}`;

  return cachify
    .fetchOrCache({
      fn: edenredService.getBalanceByCardNumber,
      args: [cardNumber],
      key: KEY,
      ttl: balanceCacheTime,
      force
    })
    .then(({ data, cache }) => {
      logger.info(`Balance fetched from ${cache ? 'cache' : 'external service and cached'}.`);
      logger.info(`Balance value: ${JSON.stringify(data)}`);
      return data;
    })
    .then(getBalanceByCurrency(prices))
    .then(fullBalance => {
      // subscribers.publish(balanceEvents.balanceFetched, fullBalance);
      logger.info('Balance retrieved correctly!');
      return res.status(200).send(fullBalance);
    })
    .catch(next);
};
