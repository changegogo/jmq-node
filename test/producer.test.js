const assert = require('assert');
const JmqClient = require('..');

describe('测试producer发送信息', function() {
      let params = {
        app: 'ddd123',
        topic: 'nodetest',
        user: 'ddd123',
        password: '9D04192E',
        host: '192.168.166.40',
        port: '9090'
    };
    it('producer成功发送信息到Jmq', async () => {
      let jmq = new JmqClient(params);
      let result = await jmq.getProducer().produce(['发送消息1']);
      assert(result.code === 0);
    })
    it('消息messages必须为数组,现在是非数组', async () => {
      let jmq = new JmqClient(params);
      let result = await jmq.getProducer().produce('发送消息1');
      assert(result.code == -1);
    });
})