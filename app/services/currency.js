const axios = require('axios');
const { get, flow, over } = require('lodash/fp');
const { currencyError } = require('../errors');

const { currencyKey, currencyUrl } = require('../../config');

const firstOptionPath = ['Realtime Currency Exchange Rate', '9. Ask Price'];
const secondOptionPath = ['Realtime Currency Exchange Rate', '5. Exchange Rate'];
const thirdOptionPath = ['Realtime Currency Exchange Rate', '8. Bid Price'];

const getPrice = flow(
  over([get(firstOptionPath), get(secondOptionPath), get(thirdOptionPath)]),
  ([firstOption, secondOption, thirdOption]) =>
    Number(firstOption) || Number(secondOption) || Number(thirdOption)
);

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
    .then(getPrice)
    .catch(err => Promise.reject(currencyError(err)));
