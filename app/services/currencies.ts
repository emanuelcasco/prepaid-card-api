import axios from 'axios';

import logger from '../logger';
import { externalError } from '../errors';
import { AVAILABLE_CURRENCIES, CURRENCY_BASE, CURRENCY_SOURCE, DEFAULT_TIMEOUT } from '../constants';
import config from '../../config';

const { baseURL, apiKey } = config.currency;

export interface IExtCurrenciesResponse {
  success: boolean;
  error?: { info: string };
  quotes?: { [currencyLabel: string]: number };
}

export interface IAvailableCurrencies {
  currencies: string[];
  source: string;
  base: string;
}

export interface ICurrenciesPrices {
  [currencyLabel: string]: number;
}

const serializeExternalResponse = (input: IExtCurrenciesResponse): ICurrenciesPrices => {
  if (input.error) {
    throw new Error(input.error.info);
  }

  if (!input.quotes) {
    throw new Error('External service returns empty currencies quote');
  }

  const { quotes } = input;

  return [...AVAILABLE_CURRENCIES, CURRENCY_BASE].reduce((result: object, currencyLabel: string) => {
    const currencyPrice = { [currencyLabel]: quotes[`${CURRENCY_SOURCE}${currencyLabel}`] };
    return Object.assign(result, currencyPrice);
  }, {});
};

export const availableCurrencies = (): Promise<IAvailableCurrencies> =>
  Promise.resolve({
    currencies: AVAILABLE_CURRENCIES,
    source: CURRENCY_SOURCE,
    base: CURRENCY_BASE
  });

export const currentPrices = async (): Promise<ICurrenciesPrices> => {
  try {
    const { data } = await axios({
      method: 'GET',
      baseURL,
      params: {
        access_key: apiKey,
        currencies: [...AVAILABLE_CURRENCIES, CURRENCY_BASE].join(','),
        source: CURRENCY_SOURCE,
        format: 1
      },
      timeout: DEFAULT_TIMEOUT
    });

    logger.info(`Fetched currencies: ${JSON.stringify(data)}`);

    return serializeExternalResponse(data);
  } catch (error) {
    return Promise.reject(externalError(error.message));
  }
};

export default {
  availableCurrencies,
  currentPrices
};
