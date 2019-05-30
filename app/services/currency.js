const axios = require('axios');

const logger = require('../logger');
const { currencyError } = require('../errors');

const { currencyKey, currencyUrl } = require('../../config');

// eslint-disable-next-line no-new

const getPrices = (currencies, base, source) => quotes => {
  return currencies.reduce((accum, currency) => ({ ...accum, [currency]: quotes[`${source}${currency}`] }), {
    [base]: quotes[`${source}${base}`]
  });
};

exports.fetchPrices = (currencies, base, source) =>
  axios({
    method: 'GET',
    url: currencyUrl,
    params: {
      access_key: currencyKey,
      currencies: [...currencies, base].join(','),
      source,
      format: 1
    }
  })
    .then(({ data }) => {
      logger.info(`Fetched currencies: ${JSON.stringify(data)}`);
      return data.success ? data.quotes : Promise.reject(data.error.info);
    })
    .then(getPrices(currencies, base, source))
    .catch(err => {
      logger.info(`Fetched currencies: ${[...currencies, base, source]}`);
      return Promise.reject(currencyError(err.message));
    });
