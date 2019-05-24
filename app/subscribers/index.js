const events = require('events');
const eventEmitter = new events.EventEmitter();

exports.subscribe = (eventName, callback) => eventEmitter.on(eventName, callback);

exports.publish = (eventName, message) => eventEmitter.emit(eventName, message);

exports.init = (subscriptions = []) => {
  subscriptions.forEach(sub => {
    exports.subscribe(sub.name, sub.callback);
  });
};
