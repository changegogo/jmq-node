const Api = require('./api');
const Producer = require('./producer');
const Consumer = require('./consumer');

class JMPClient {
    constructor(params) {
       this.api = new Api(params);
       this.producer = new Producer(this.api);
       this.consumer = new Consumer(this.api);
    }
}

module.exports = JMPClient;