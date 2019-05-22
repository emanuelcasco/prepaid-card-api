const woloxConfig = require('eslint-config-wolox-node');

module.exports = {
  ...woloxConfig,
  rules: {
    ...woloxConfig.rules,
    "arrow-body-style": 0
  }
};
