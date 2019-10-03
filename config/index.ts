import { IConfig } from '../types/config';

const ENVIRONMENT: string = process.env.NODE_ENV || 'development';

if (ENVIRONMENT !== 'production') {
  require('dotenv').config();
}

const configFile = `./${ENVIRONMENT}`;

const isObject = (variable: unknown): boolean => variable instanceof Object;

/*
 * Deep copy of source object into tarjet object.
 * It does not overwrite properties.
 */
const assignObject = <T>(target: T, source: IConfig): T & IConfig | T => {
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

const config: IConfig = {
  environment: ENVIRONMENT,
  common: {
    api: {
      bodySizeLimit: process.env.API_BODY_SIZE_LIMIT,
      parameterLimit: process.env.API_PARAMETER_LIMIT,
      port: process.env.PORT
    }
  },
  balance: {
    baseURL: process.env.EDENRED_API_URL,
    cache: {
      namespace: 'BALANCE_API',
      key: 'BALANCE',
      ttl: Number(process.env.BALANCE_CACHE_TIME)
    }
  },
  currency: {
    baseURL: process.env.CURRENCY_API_URL,
    apiKey: process.env.CURRENCY_API_KEY,
    cache: {
      namespace: 'CURRENCY_PRICES',
      key: 'CURRENCY',
      ttl: Number(process.env.CURRENCY_CACHE_TIME)
    }
  },
  redis: {
    baseURL: process.env.REDIS_URL
  }
};

const customConfig = require(configFile).config;

assignObject(customConfig, config);

export default customConfig;
