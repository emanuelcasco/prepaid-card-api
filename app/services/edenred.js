const axios = require('axios');
const { edenredError } = require('../errors');

const { edenredUrl } = require('../../config');

exports.getBalanceByCardNumber = cardNumber =>
  axios({
    method: 'GET',
    url: `${edenredUrl}/${cardNumber}`
  })
    .then(res => res.data.match(/\d+.\d+/))
    .then(([value]) => Number(value))
    .catch(err => Promise.reject(edenredError(err)));
