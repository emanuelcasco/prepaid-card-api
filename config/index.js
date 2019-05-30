const ENVIRONMENT = process.env.NODE_ENV || 'development';

if (ENVIRONMENT !== 'production') {
  require('dotenv').config();
}

const configFile = `./${ENVIRONMENT}`;

const isObject = variable => variable instanceof Object;

/*
 * Deep copy of source object into tarjet object.
 * It does not overwrite properties.
 */
const assignObject = (target, source) => {
  if (target && isObject(target) && source && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(target, key) || target[key] === undefined) {
        target[key] = source[key];
      } else {
        assignObject(target[key], source[key]);
      }
    });
  }
  return target;
};

const config = {
  redisUrl: process.env.REDIS_URL,
  edenredUrl: process.env.EDENRED_API_URL,
  currencyUrl: process.env.CURRENCY_API_URL,
  currencyKey: process.env.CURRENCY_API_KEY,
  currencyCacheTime: Number(process.env.CURRENCY_CACHE_TIME),
  balanceCacheTime: Number(process.env.BALANCE_CACHE_TIME),
  common: {
    api: {
      bodySizeLimit: process.env.API_BODY_SIZE_LIMIT,
      parameterLimit: process.env.API_PARAMETER_LIMIT,
      port: process.env.PORT
    },
    session: {
      header_name: 'authorization',
      secret: process.env.NODE_API_SESSION_SECRET
    }
  }
};

const customConfig = require(configFile).config;
module.exports = assignObject(customConfig, config);
