import { Application } from 'express';

import { healthCheck } from './controllers/healthCheck';
import balanceService from './controllers/balance';

export const init = (app: Application): void => {
  app.get('/health', healthCheck);

  app.get('/balance/:creditCardNumber', balanceService.getCurrentBalance);

  app.get('/currencies', balanceService.getCurrenciesPrices);
  app.get('/currencies/available', balanceService.getAvailableCurrencies);
};
