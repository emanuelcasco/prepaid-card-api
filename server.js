// const cluster = require('cluster');
// const os = require('os');

const app = require('./app');
const config = require('./config');
const logger = require('./app/logger');

const port = config.common.api.port || 8080;

const runExpressServer = () => {
  return Promise.resolve()
    .then(() => {
      app.listen(port);
      logger.info(`Listening on port: ${port}`);
    })
    .catch(logger.error);
};

runExpressServer();

// // Check if current process is master.
// if (cluster.isMaster) {
//   // Get total CPU cores.
//   const cpuCount = os.cpus().length;

//   // Spawn a worker for every core.
//   for (let j = 0; j < cpuCount; j++) {
//     cluster.fork();
//   }
// } else {
//   // This is not the master process, so we spawn the express server.
//   runExpressServer();
// }

// // Cluster API has a variety of events.
// // Here we are creating a new process if a worker die.
// cluster.on('exit', worker => {
//   logger.info(`Worker ${worker.id} died'`);
//   logger.info('Staring a new one...');

//   cluster.fork();
// });
