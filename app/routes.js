const { healthCheck } = require('./controllers/healthCheck');
const balanceController = require('./controllers/balance');
const validate = require('./middlewares/validator');
const { fetchAvailableCurrenciesPrice } = require('./middlewares/currency');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/available-currencies', balanceController.getAvailableCurrencies);
  app.get(
    '/balance/:cardNumber',
    [validate.getBalance, fetchAvailableCurrenciesPrice],
    balanceController.getBalanceByCardNumber
  );
};
