const assert = require('assert');
const JmqClient = require('..');
const conf = require('../conf');
const _ = require('lodash');

describe('测试consumer拉取消息', function() {
    let params = {
        app: 'ddd1234',
        topic: 'nodetest',
        user: 'ddd1234',
        password: '0F75C8EB',
        host: '192.168.166.40',
        port: '9090'
    };
    it('consumer成功拉取消息', async () => {
        let consumer = new JmqClient(params).getConsumer();
        let info = await consumer.pull();
        assert(info.code === 0);
    })
    it('consumer成功拉取消息,并且成功消费', async () => {
        let consumer = new JmqClient(params).getConsumer();
        let info = await consumer.pull();
        let ackRes = await consumer.ack(info.result);
        assert(info.code === 0 && ackRes.code === 0);
    })
    // it('consumer成功拉取消息,并且进行重试', async () => {
    //     let consumer = new JmqClient(params).getConsumer();
    //     let info = await consumer.consume();
    //     let retryAckRed = await consumer.retry(info.result, 'err');
    //     assert(info.code === 0 && retryAckRed.code === 0);
    // })
})

