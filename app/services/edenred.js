const axios = require('axios');

const logger = require('../logger');
const { edenredError } = require('../errors');

const { edenredUrl } = require('../../config');

exports.getBalanceByCardNumber = cardNumber =>
  axios({
    method: 'GET',
    url: `${edenredUrl}/${cardNumber}`
  })
    .then(res => res.data)
    .then(res => {
      logger.info(`Edenred API response: ${JSON.stringify(res)}`);
      const [value] = res.match(/\d+.\d+/);
      return Number(value);
    })
    .catch(err => Promise.reject(edenredError(err)));
