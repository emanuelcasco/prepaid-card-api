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

const getCurrencyResponse = (value, option = 'firstOption') =>
  set(
    {
      firstOption: ['Realtime Currency Exchange Rate', '9. Ask Price'],
      secondOption: ['Realtime Currency Exchange Rate', '5. Exchange Rate'],
      thirdOption: ['Realtime Currency Exchange Rate', '8. Bid Price']
    }[option],
    value,
    {}
  );

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

  describe('get currency for external api', () => {
    beforeEach(() => {
      nock(edenredUrl)
        .get(/.*$/)
        .reply(200, getAvailableBalance(BALANCE));
    });

    test.each(AVAILABLE_CURRENCIES)(
      'should take second option when first one is unavailable for: %s',
      (currency, done) => {
        AVAILABLE_CURRENCIES.forEach(c => {
          nock(currencyUrl)
            .get(new RegExp(c))
            .reply(200, getCurrencyResponse(mockPrices[c], 'secondOption'));
        });

        validateSuccesfullRequest(res => {
          expect(res).toBeTruthy();
          expect(res.body.balance[currency]).toBe(formatCurrency(BALANCE / mockPrices[currency]));
        }, done);
      }
    );

    test.each(AVAILABLE_CURRENCIES)(
      'should take third option when first and second ones are unavailable for: %s',
      (currency, done) => {
        AVAILABLE_CURRENCIES.forEach(c => {
          nock(currencyUrl)
            .get(new RegExp(c))
            .reply(200, getCurrencyResponse(mockPrices[c], 'thirdOption'));
        });

        validateSuccesfullRequest(res => {
          expect(res).toBeTruthy();
          expect(res.body.balance[currency]).toBe(formatCurrency(BALANCE / mockPrices[currency]));
        }, done);
      }
    );
  });
});
