import request, { Response } from 'supertest';
import nock from 'nock';

import app from '../app';
import config from '../config';

import { IExtCurrenciesResponse } from '../app/services/currencies';
import { CURRENCY_BASE, CURRENCY_SOURCE, AVAILABLE_CURRENCIES } from '../app/constants';
import { formatMoney } from '../app/helpers/formater';

const balanceURL = config.balance.baseURL;
const currencyURL = config.currency.baseURL;

const DEFAULT_CREDIT_CARD_NUMBER = 9999_9999_9999;
const BALANCE = 10_000.5;

const getCurrencyResponse = (
  quotes: { [currencyLabel: string]: number },
  error?: { info: string }
): IExtCurrenciesResponse => ({
  success: true,
  quotes,
  error
});

const getAvailableBalance = (value: number): string => `"{\\"AvailableBalance\\":${value}}"`;

jest.mock('../app/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('GET /balance/:creditCardNumber', () => {
  // eslint-disable-next-line init-declarations
  let response: Response;

  const mockPrices = AVAILABLE_CURRENCIES.reduce(
    (accum: { [key: string]: number }, currency: string) => ({ ...accum, [currency]: Math.random() }),
    {}
  );

  const mockPricesResponse = Object.keys(mockPrices).reduce(
    (accum: { [key: string]: number }, key: string) => ({
      ...accum,
      [`${CURRENCY_SOURCE}${key}`]: mockPrices[key]
    }),
    {}
  );

  describe('200 OK', () => {
    beforeAll((done: jest.DoneCallback) => {
      nock(currencyURL)
        .get(/.*$/)
        .reply(200, getCurrencyResponse(mockPricesResponse));
      nock(balanceURL)
        .get(/.*$/)
        .reply(200, getAvailableBalance(BALANCE));
      request(app)
        .get(`/balance/${DEFAULT_CREDIT_CARD_NUMBER}`)
        .end((error, res) => {
          if (error) done(error);
          response = res;
          done();
        });
    });

    test('succesful response should return 200', () => {
      expect(response.status).toBe(200);
    });

    test('succesful response should return a valid body', () => {
      expect(response.body).toEqual(expect.any(Object));

      expect(response.body).toEqual({
        prices: expect.any(Object),
        balance: expect.any(Object)
      });
    });

    test.each(AVAILABLE_CURRENCIES)('should return expected balance for: %s', (currency: string) => {
      const sourceCurrencyAmount = BALANCE / mockPrices[CURRENCY_BASE];
      expect(response.body.balance[currency]).toBe(formatMoney(sourceCurrencyAmount * mockPrices[currency]));
    });
  });
});
