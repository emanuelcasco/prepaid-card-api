import { Request, Response, NextFunction } from 'express';

import logger from '../logger';
import { CURRENCY_BASE, CURRENCY_SOURCE } from '../constants';
import Cachify, { ICacheOutput } from '../libs/cachify';
import edenredService from '../services/edenred';
import currenciesService, { IAvailableCurrencies, ICurrenciesPrices } from '../services/currencies';
import { formatMoney } from '../helpers/formater';
import config from '../../config';
import { ICacheConfig } from '../../types/config';

interface ICurrentBalance {
  balance: { [currencyLabel: string]: string };
  prices: ICurrenciesPrices;
}

const balanceCacheConfig: ICacheConfig = config.balance.cache;
const currencyCacheConfig: ICacheConfig = config.currency.cache;
const redisBaseUrl = config.redis.baseURL;

const cachify = new Cachify(redisBaseUrl);

const mapBalanceByCurrency = (edenredBalance: number, prices: ICurrenciesPrices): ICurrentBalance => {
  const sourceCurrencyBalancce = edenredBalance / prices[CURRENCY_BASE];

  const balance = Object.keys(prices).reduce(
    (accum, key) => ({ ...accum, [key]: formatMoney(sourceCurrencyBalancce * prices[key]) }),
    { [CURRENCY_SOURCE]: formatMoney(sourceCurrencyBalancce) }
  );
  return { balance, prices };
};

export const getCurrentBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const { creditCardNumber } = req.params;
  logger.info('Fetching current balance.');
  try {
    const [balanceResponse, pricesResponse]: [
      ICacheOutput<number>,
      ICacheOutput<ICurrenciesPrices>
    ] = await Promise.all([
      cachify.fetchOrCache({
        fn: edenredService.balance,
        args: [creditCardNumber],
        key: `${balanceCacheConfig.key}:${creditCardNumber}`,
        ttl: balanceCacheConfig.ttl
      }),
      cachify.fetchOrCache({
        fn: currenciesService.currentPrices,
        args: [],
        key: currencyCacheConfig.key,
        ttl: currencyCacheConfig.ttl
      })
    ]);

    const response: ICurrentBalance = mapBalanceByCurrency(balanceResponse.data, pricesResponse.data);

    logger.info('Fetched current balance!');
    return res.send(response);
  } catch (error) {
    return next(error);
  }
};

export const getCurrenciesPrices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  logger.info('Fetching currencies prices.');
  try {
    const currenciesResponse: ICacheOutput<ICurrenciesPrices> = await cachify.fetchOrCache({
      fn: currenciesService.currentPrices,
      args: [],
      key: currencyCacheConfig.key,
      ttl: currencyCacheConfig.ttl
    });

    const prices: ICurrenciesPrices = currenciesResponse.data;

    logger.info('Fetched currencies prices!');
    return res.send({ prices });
  } catch (error) {
    return next(error);
  }
};

export const getAvailableCurrencies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  logger.info('Fetching available currencies.');
  try {
    const availableCurrencies: IAvailableCurrencies = await currenciesService.availableCurrencies();

    logger.info('Fetched available currencies!');
    return res.send({ availableCurrencies });
  } catch (error) {
    return next(error);
  }
};

export default {
  getCurrentBalance,
  getCurrenciesPrices,
  getAvailableCurrencies
};
