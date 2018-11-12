const JMPClient = require('../lib/client');
const client = new JMPClient();
var producer = client.producer;

async function test() {
    let response = await producer.produce(['消息dlw1','消息dlw2']);
    console.log(response);
}
test();
