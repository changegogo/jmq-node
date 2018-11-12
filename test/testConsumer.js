const JMPClient = require('../lib/client');
const client = new JMPClient();
var consumer = client.consumer;

async function test() {
    try {
        let info = await consumer.consume();
        console.log(info);
        console.log(info.result);
        let ackRes = await consumer.ack(info.result);
        //let retryAckRed = await consumer.retry(info.result, 'err');
        console.log(ackRes);
    } catch (error) {
        console.error(error.message);
    }
}
test();
