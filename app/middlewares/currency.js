const Cachify = require('../libs/cachify');
const logger = require('../logger');
const currencyService = require('../services/currency');

const { currencyCacheTime, redisUrl } = require('../../config');

const {
  AVAILABLE_CURRENCIES,
  CURRENCY_BASE,
  CURRENCY_SOURCE,
  CURRENCY_CACHE_KEY,
  CURRENCY_PRICE_NAMESPACE
} = require('../constants');

const cachify = new Cachify(redisUrl);

exports.fetchAvailableCurrenciesPrice = (req, res, next) => {
  logger.info(`Fetching currencies: ${AVAILABLE_CURRENCIES}`);

  return cachify
    .fetchOrCache({
      fn: currencyService.fetchPrices,
      args: [AVAILABLE_CURRENCIES, CURRENCY_BASE, CURRENCY_SOURCE],
      key: CURRENCY_CACHE_KEY,
      ttl: currencyCacheTime
    })
    .then(({ data, cache }) => {
      logger.info(`Currencies fetched from ${cache ? 'cache' : 'external service and cached'}.`);
      logger.info(`Currencies value: ${JSON.stringify(data)}`);

      // Save available currencies prices in response and cache
      res[CURRENCY_PRICE_NAMESPACE] = data;
      return next();
    })
    .catch(err => {
      logger.error(err);
      return next(err);
    });
};
