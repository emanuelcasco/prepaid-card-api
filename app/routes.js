const balanceController = require('./controllers/balance');
const { fetchAvailableCurrenciesPrice } = require('./middlewares/currency');

const { healthCheck } = require('./controllers/healthCheck');
exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/balance/:cardNumber', [fetchAvailableCurrenciesPrice], balanceController.getBalanceByCardNumber);
};
