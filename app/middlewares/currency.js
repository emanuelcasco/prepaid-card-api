const mcache = require('memory-cache');

const logger = require('../logger');
const currencyService = require('../services/currency');

const {
  AVAILABLE_CURRENCIES,
  CURRENCY_BASE,
  CURRENCY_SOURCE,
  CURRENCY_CACHE_KEY,
  CURRENCY_PRICE_NAMESPACE
} = require('../constants');
const { currencyCacheTime } = require('../../config');

// eslint-disable-next-line consistent-return
exports.fetchAvailableCurrenciesPrice = (req, res, next) => {
  logger.info(`Fetching currencies: ${AVAILABLE_CURRENCIES}`);

  const cachedCurrencies = mcache.get(CURRENCY_CACHE_KEY);
  if (cachedCurrencies) {
    // Take currencies from cache
    res[CURRENCY_PRICE_NAMESPACE] = JSON.parse(cachedCurrencies);
    logger.info('Currencies fetched from cache!');
    next();
  } else {
    return currencyService
      .convert(AVAILABLE_CURRENCIES, CURRENCY_BASE, CURRENCY_SOURCE)
      .then(currencies => {
        // Save available currencies prices in response and cache
        res[CURRENCY_PRICE_NAMESPACE] = currencies;

        // Cache currecnies
        mcache.put(CURRENCY_CACHE_KEY, JSON.stringify(currencies), currencyCacheTime, () => {
          logger.info('Currencies cache expired!');
        });

        logger.info('Currencies fetched from external service and cached!');
        next();
      })
      .catch(err => {
        logger.error(err);
        next(err);
      });
  }
};
