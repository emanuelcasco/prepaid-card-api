const request = require('supertest');
const nock = require('nock');
const dictum = require('dictum.js');
const { set } = require('lodash/fp');

const app = require('../app');
const logger = require('../app/logger');
const { currencyUrl, edenredUrl } = require('../config');

const VALID_CREDIT_CARD_NUMBER = 999999999999;

logger.info = jest.fn();
logger.error = jest.fn();

const getCurrencyResponse = value => set(['Realtime Currency Exchange Rate', '9. Ask Price'], value, {});
const getAvailableBalance = value => `"{\\"AvailableBalance\\":${value}}"`;

describe('GET /balance/:creditCard', () => {
  describe('succesfull cases', () => {
    beforeEach(() => {
      nock(currencyUrl)
        .get(/CLP/)
        .reply(200, getCurrencyResponse(0.0645))
        .get(/USD/)
        .reply(200, getCurrencyResponse(44.8));
      nock(edenredUrl)
        .get(/.*$/)
        .reply(200, getAvailableBalance(10000.5));
    });

    test('succesful log all traces correctly', done => {
      request(app)
        .get(`/balance/${VALID_CREDIT_CARD_NUMBER}`)
        .then(res => {
          expect(res).toBeTruthy();
          expect(logger.info).toHaveBeenCalledWith('Fetching currencies: ["CLP","USD"]');
          expect(logger.info).toHaveBeenCalledWith('Currencies fetched from external service and cached!');
          expect(logger.info).toHaveBeenCalledWith(
            'Edenred API response: "{\\"AvailableBalance\\":10000.5}"'
          );
          expect(logger.info).toHaveBeenCalledWith('Balance retrieved correctly!');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    test('should return status 200', done => {
      request(app)
        .get(`/balance/${VALID_CREDIT_CARD_NUMBER}`)
        .then(res => {
          expect(res).toBeTruthy();
          expect(res.status).toBe(200);
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    test('should return expected body', done => {
      request(app)
        .get(`/balance/${VALID_CREDIT_CARD_NUMBER}`)
        .then(res => {
          expect(res).toBeTruthy();
          expect(res.body.balance).toEqual({
            ARS: '$10,000.50',
            CLP: '$155,046.51',
            USD: '$223.23'
          });
          expect(res.body.prices).toEqual({
            CLP: 0.0645,
            USD: 44.8
          });
          dictum.chai(res, 'Balance');
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});
