const balanceController = require('./controllers/balance');
const validate = require('./middlewares/validator');
const { fetchAvailableCurrenciesPrice } = require('./middlewares/currency');

const { healthCheck } = require('./controllers/healthCheck');
exports.init = app => {
  app.get('/health', healthCheck);
  app.get(
    '/balance/:cardNumber',
    [validate.getBalance, fetchAvailableCurrenciesPrice],
    balanceController.getBalanceByCardNumber
  );
};
