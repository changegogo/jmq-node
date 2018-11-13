module.exports = {
    retryInterval: 1000,        // 重试间隔时间ms
    maxRetryCount: 2,           // 最大重试次数
    apiVersion: '1.0',          // proxy api版本号
    pickData: ['topic', 'app', 'address', 'brokerGroup', 'consumerId'],     // ack和retry中构建请求参数需要包含的属性
    pickLocations: ['journalOffset', 'queueId', 'queueOffset', 'topic'],    // ack和retry中构建请求参数locations属性对象需要包含的属性
    conParamsKeys: ['topic', 'app', 'user', 'password', 'host', 'port']     // 连接参数的key值
}