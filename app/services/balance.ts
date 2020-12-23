import axios from 'axios';

import logger from '../logger';
import { externalError } from '../errors';
import { DEFAULT_TIMEOUT } from '../constants';
import config from '../../config';

const { baseURL } = config.balance;

const serializeExternalResponse = (input: string): number => {
  const regexp = /AvailableBalance|(\d+(\.\d+)?)|(\.\d+)/g;
  const matched = input.match(regexp);

  if (matched) {
    const [check, value] = matched;
    if (check && check === 'AvailableBalance') {
      return Number(value);
    }
  }
  throw Error('Balance is not available!');
};

export const balance = async (creditCardNumber: number): Promise<number> => {
  try {
    const { data } = await axios({
      method: 'GET',
      baseURL,
      url: `/${creditCardNumber}`,
      timeout: DEFAULT_TIMEOUT
    });

    logger.info(`Balance API response: "${data.slice(0, 100)}"`);

    const value = serializeExternalResponse(data);

    return value;
  } catch (error) {
    return Promise.reject(externalError(error.message));
  }
};

export default {
  balance
};
