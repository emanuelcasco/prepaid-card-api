const request = require('supertest');
const nock = require('nock');
const dictum = require('dictum.js');
const { set } = require('lodash/fp');

const app = require('../app');
const logger = require('../app/logger');
const { AVAILABLE_CURRENCIES } = require('../app/constants');
const { currencyUrl, edenredUrl } = require('../config');
const { formatCurrency } = require('../app/utils');

const VALID_CREDIT_CARD_NUMBER = 999999999999;
const BALANCE = 10000.5;

const getCurrencyResponse = value => set(['Realtime Currency Exchange Rate', '9. Ask Price'], value, {});
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
  const mockPrices = AVAILABLE_CURRENCIES.reduce((accum, currency) => {
    return { ...accum, [currency]: Math.random() };
  }, {});

  describe('succesfull cases', () => {
    beforeEach(() => {
      AVAILABLE_CURRENCIES.forEach(currency => {
        nock(currencyUrl)
          .get(new RegExp(currency))
          .reply(200, getCurrencyResponse(mockPrices[currency]));
      });
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
        expect(res.body.balance[currency]).toBe(formatCurrency(BALANCE / mockPrices[currency]));
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
