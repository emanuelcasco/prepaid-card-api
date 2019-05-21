const logger = require('../logger');
const currencyService = require('../services/currency');
const { AVAILABLE_CURRENCIES, CURRENCY_PRICE_NAMESPACE, DEFAULT_CURRENCY } = require('../constants');

const fetchCurrencyPrice = currency =>
  currencyService.convert(currency, DEFAULT_CURRENCY).then(price => ({ name: currency, price }));

exports.fetchAvailableCurrenciesPrice = (req, res, next) => {
  logger.info(`Fetching currencies: ${JSON.stringify(AVAILABLE_CURRENCIES)}`);

  return Promise.all(AVAILABLE_CURRENCIES.map(fetchCurrencyPrice))
    .then(prices => {
      // Save available currencies prices in response
      res[CURRENCY_PRICE_NAMESPACE] = prices.reduce(
        (accum, current) => ({ ...accum, [current.name]: current.price }),
        {}
      );
      next();
    })
    .catch(next);
};
