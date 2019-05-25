const request = require('supertest');
const nock = require('nock');
const dictum = require('dictum.js');

const app = require('../app');
const logger = require('../app/logger');
const { AVAILABLE_CURRENCIES, CURRENCY_BASE, CURRENCY_SOURCE } = require('../app/constants');
const { currencyUrl, edenredUrl } = require('../config');
const { formatCurrency } = require('../app/utils');

const FETCHED_CURRENCIES = [...AVAILABLE_CURRENCIES, CURRENCY_BASE];

const VALID_CREDIT_CARD_NUMBER = 999999999999;
const BALANCE = 10000.5;

const getCurrencyResponse = quotes => ({ success: true, quotes });

const getAvailableBalance = value => `"{\\"AvailableBalance\\":${value}}"`;

const validateSuccesfullRequest = (cb, done) =>
  request(app)
    .get(`/balance/${VALID_CREDIT_CARD_NUMBER}`)
    .then(cb)
    .then(() => done())
    .catch(done);

logger.info = jest.fn();
logger.error = jest.fn();

describe('GET /balance/:creditCard', () => {
  const mockPrices = FETCHED_CURRENCIES.reduce((accum, currency) => {
    return { ...accum, [currency]: Math.random() };
  }, {});

  const mockPricesResponse = Object.keys(mockPrices).reduce((accum, key) => {
    return { ...accum, [`${CURRENCY_SOURCE}${key}`]: mockPrices[key] };
  }, {});

  describe('succesfull cases', () => {
    beforeEach(() => {
      nock(currencyUrl)
        .get(/.*$/)
        .reply(200, getCurrencyResponse(mockPricesResponse));
      nock(edenredUrl)
        .get(/.*$/)
        .reply(200, getAvailableBalance(BALANCE));
    });

    test('succesful log all traces correctly', done => {
      validateSuccesfullRequest(res => {
        expect(res).toBeTruthy();
        expect(logger.info).toHaveBeenCalledWith(`Fetching currencies: ${AVAILABLE_CURRENCIES}`);
        expect(logger.info).toHaveBeenCalledWith('Currencies fetched from external service and cached!');
        expect(logger.info).toHaveBeenCalledWith('Edenred API response: "{"AvailableBalance":10000.5}"');
        expect(logger.info).toHaveBeenCalledWith('Balance retrieved correctly!');
      }, done);
    });

    test('should return status 200', done => {
      validateSuccesfullRequest(res => {
        expect(res).toBeTruthy();
        expect(res.status).toBe(200);
      }, done);
    });

    test.each(AVAILABLE_CURRENCIES)('should return expected balance for: %s', (currency, done) => {
      validateSuccesfullRequest(res => {
        expect(res).toBeTruthy();
        const sourceCurrencyAmount = BALANCE / mockPrices[CURRENCY_BASE];
        expect(res.body.balance[currency]).toBe(formatCurrency(sourceCurrencyAmount * mockPrices[currency]));
      }, done);
    });

    test('should return expected currency prices', done => {
      validateSuccesfullRequest(res => {
        expect(res).toBeTruthy();
        expect(res.body.prices).toMatchObject(mockPrices);
      }, done);
    });

    test('should document response', done => {
      validateSuccesfullRequest(res => {
        expect(res).toBeTruthy();
        dictum.chai(res, 'Balance');
      }, done);
    });
  });
});
