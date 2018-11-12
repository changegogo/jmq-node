const assert = require('assert');
const JmqClient = require('..');
const conf = require('../conf');
const _ = require('lodash');

describe('consumer测试相等', function() {
    it('相等', async () => {
      assert(1 === 1)
    })
})

describe('测试consumer拉取消息', function() {
    it('consumer成功拉取消息', async () => {
        let consumer = new JmqClient().getConsumer();
        let info = await consumer.consume();
        assert(info.code === 0);
    })
})

