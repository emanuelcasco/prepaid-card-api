const mcache = require('memory-cache');
const { reduce } = require('lodash/fp');

const logger = require('../logger');
const currencyService = require('../services/currency');

const {
  AVAILABLE_CURRENCIES,
  CURRENCY_CACHE_KEY,
  CURRENCY_PRICE_NAMESPACE,
  DEFAULT_CURRENCY
} = require('../constants');
const { currencyCacheTime } = require('../../config');

const fetchCurrencyPrice = currency =>
  currencyService.convert(currency, DEFAULT_CURRENCY).then(price => ({ name: currency, price }));

exports.fetchAvailableCurrenciesPrice = (req, res, next) => {
  logger.info(`Fetching currencies: ${JSON.stringify(AVAILABLE_CURRENCIES)}`);

  const cachedCurrencies = mcache.get(CURRENCY_CACHE_KEY);
  if (cachedCurrencies) {
    logger.info('Currencies fetched from cache!');
    res[CURRENCY_PRICE_NAMESPACE] = JSON.parse(cachedCurrencies);
    next();
  } else {
    Promise.all(AVAILABLE_CURRENCIES.map(fetchCurrencyPrice))
      .then(reduce((accum, current) => ({ ...accum, [current.name]: Number(current.price) }), {}))
      .then(currencies => {
        // Save available currencies prices in response and cache
        res[CURRENCY_PRICE_NAMESPACE] = currencies;
        mcache.put(CURRENCY_CACHE_KEY, JSON.stringify(currencies), currencyCacheTime, () => {
          logger.info('Currencies cache expired!');
        });
        logger.info('Currencies fetched from external service and cached!');
        next();
      })
      .catch(next);
  }
};
