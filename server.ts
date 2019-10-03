import app from './app';
import config from './config';
import logger from './app/logger';
const defaultPort = 8080;

const port = config.common.api.port || defaultPort;

Promise.resolve()
  .then(() => {
    app.listen(port);

    logger.info(`Listening on port: ${port}`);
  })
  .catch(logger.error);
