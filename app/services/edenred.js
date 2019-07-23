const axios = require('axios');

const logger = require('../logger');
const { edenredError } = require('../errors');

const { edenredUrl } = require('../../config');

const validateResponse = data => {
  const regexp = /AvailableBalance|\d+.\d+/g;
  const [check, value] = data.match(regexp);
  if (check && check === 'AvailableBalance') {
    return Number(value);
  }
  throw Error('Edenred is not available!');
};

const truncate = text => text.slice(0, 100);

exports.getBalanceByCardNumber = cardNumber =>
  axios({
    method: 'GET',
    url: `${edenredUrl}/${cardNumber}`,
    timeout: 10000
  })
    .then(res => {
      logger.info(`Edenred API response: "${truncate(res.data)}"`);
      const value = validateResponse(res.data);
      return Number(value);
    })
    .catch(err => Promise.reject(edenredError(err.message)));
