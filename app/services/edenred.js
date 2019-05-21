const axios = require('axios');

const logger = require('../logger');
const { edenredError } = require('../errors');

const { edenredUrl } = require('../../config');

exports.getBalanceByCardNumber = cardNumber =>
  axios({
    method: 'GET',
    url: `${edenredUrl}/${cardNumber}`
  })
    .then(res => {
      logger.info(`Edenred API response: ${JSON.stringify(res.data)}`);
      const [value] = res.data.match(/\d+.\d+/);
      return Number(value);
    })
    .catch(err => Promise.reject(edenredError(err)));
