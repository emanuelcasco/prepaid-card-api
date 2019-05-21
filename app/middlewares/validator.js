const Joi = require('@hapi/joi');

const { requestError } = require('../errors');

const validate = (attr, schema) => (req, res, next) => {
  // return all errors a payload contains, not just the first one Joi finds
  Joi.validate(req[attr], schema, { abortEarly: false })
    .then(() => next())
    .catch(err => {
      next(requestError(err.details));
    });
};

const balanceSchema = Joi.object().keys({
  cardNumber: Joi.number()
    .integer()
    .required()
});

exports.getBalance = validate('params', balanceSchema);
