module.exports = {
    retryInterval: 1000,        // 重试间隔时间ms
    maxRetryCount: 3,           // 最大重试次数
    apiVersion: '1.0',          // proxy api版本号
    host: '192.168.166.40',     // proxy host
    port: '9090',               // proxy port
    producerParams: {           // 生产者应用信息
        app: 'ddd123',          // 应用名,Jmq管理端apply
        topic: 'nodetest',      // 主题,Jmq管理端apply
        user: 'ddd123',         // 用户名,Jmq管理端apply
        password: '9D04192E'    // 密码,Jmq管理端apply
    },
    consumerParams: {           // 消费者应用信息
        app: 'ddd1234',  
        topic: 'nodetest',  
        user: 'ddd1234',  
        password: '0F75C8EB',  
    },
    pickData: ['topic', 'app', 'address', 'brokerGroup', 'consumerId'],  // ack和retry中构建请求参数需要包含的属性
    pickLocations: ['journalOffset', 'queueId', 'queueOffset', 'topic']  // ack和retry中构建请求参数locations属性对象需要包含的属性
}