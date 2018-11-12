const Api = require('./api');
const Producer = require('./producer');
const Consumer = require('./consumer');

class JMPClient {
    constructor() {
       this.api = new Api();
       this.producer = null;
       this.consumer = null;
    }

    getProducer() {
        if(!this.producer) {
            this.producer = new Producer(this.api);
        }
        return this.producer;
    }

    getConsumer() {
        if(!this.consumer) {
            this.consumer = new Consumer(this.api);
        }
        return this.consumer;
    }
}

module.exports = JMPClient;