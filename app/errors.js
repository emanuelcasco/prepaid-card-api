const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.CURRENCY_ERROR = 'currency_error';
exports.currencyError = message => internalError(message, exports.CURRENCY_ERROR);

exports.EDENRED_ERROR = 'edenred_error';
exports.edenredError = message => internalError(message, exports.EDENRED_ERROR);

exports.REQUEST_ERROR = 'request_error';
exports.requestError = message => internalError(message, exports.REQUEST_ERROR);

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
