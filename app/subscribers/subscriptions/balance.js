const logger = require('../../logger');

const eventsName = {
  balanceFetched: 'balance-fetched'
};

const subscriptions = [
  {
    name: eventsName.balanceFetched,
    callback: ({ prices }) => {
      logger.info(`Currencies response: ${JSON.stringify(prices)}`);
    }
  },
  {
    name: eventsName.balanceFetched,
    callback: ({ balance }) => {
      logger.info(`Balance response: ${JSON.stringify(balance)}`);
    }
  }
];

exports.events = eventsName;
exports.subscriptions = subscriptions;
