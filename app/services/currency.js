const axios = require('axios');
const { get } = require('lodash/fp');
const { currencyError } = require('../errors');

const { currencyKey, currencyUrl } = require('../../config');

const askPricePath = ['Realtime Currency Exchange Rate', '9. Ask Price'];

exports.convert = (from, to) =>
  axios({
    method: 'GET',
    url: currencyUrl,
    params: {
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: from,
      to_currency: to,
      apikey: currencyKey
    }
  })
    .then(res => res.data)
    .then(get(askPricePath))
    .catch(err => Promise.reject(currencyError(err)));
