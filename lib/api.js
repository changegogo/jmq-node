const _ = require('lodash');
const conf = require('../conf');
const req = require('request-promise');
const sleep = require('../utils/sleep');

class Api {
    /**
     * input
     * @param {Object} connectParams 连接参数，jmp后台申请
     *  {string} connectParams.app 应用名
     *  {string} connectParams.topic 主题
     *  {string} connectParams.username 用户名
     *  {string} connectParams.password 密码
     *  {string} connectParams.host 主机ip
     *  {string} connectParams.port 主机端口
     */
    constructor() {
        this.apiVersion = conf.apiVersion;

        this.producer = {
            app: conf.producerParams.app,
            topic: conf.producerParams.topic,
            username: conf.producerParams.user,
            password: conf.producerParams.password
        };
        this.consumer = {
            app: conf.consumerParams.app,
            topic: conf.consumerParams.topic,
            username: conf.consumerParams.user,
            password: conf.consumerParams.password
        };

        this.host = conf.host;
        this.port = conf.port;

        this.headers = {
            'connection':"keep-alive",
            'user-agent': 'JMQ-javascript/1.0.1',
            'accept': 'text/plain',
            'host': conf.host,
            'timestamp': ''
        }
    }

    // 发送http请求
    async invokeHttpRequest(url, reqBody) {
        this.headers.timestamp = String(new Date().getTime());
        let options = {
            url: url,
            method: 'POST',
            headers: this.headers,
            body: reqBody,
            json: true
        }
        //console.log(options);
        try {
            let res = await req(options);
            let resData = {};
            if(res.status.code === 0) {
                resData.code =  0;
                resData.result = res.result;
            }else {
                resData.code = -1;
                resData.msg = res.status.msg || '';
            }
            return resData;
        } catch (error) {
            return {
                code: -1,
                msg: error.message
            }
        } 
    }

    // 重试http请求
    async invokeHttpRequestRetry(url, reqBody) {
        let maxRetryCount = conf.maxRetryCount;
        let res = null;
        while(maxRetryCount-- > 0) {
            res = await this.invokeHttpRequest(url, reqBody);
            if(res.code === 0) {
                break;
            }else {
                await sleep(conf.retryInterval);
            }
        }
        return res;
    }

    // 认证
    async auth(type) {
        if(['producer', 'consumer'].indexOf(type) === -1) {
            throw new Error('type must be in [\'producer\', \'consumer\']');
        }
        let data = {
            app: this[type].app,
            topic: this[type].topic,
            user: this[type].username,
            password: this[type].password
        }
        let preUrl = `http://${this.host}:${this.port}/${conf.apiVersion}/auth`;
        try {
            let res = await this.invokeHttpRequestRetry(preUrl, data);
            if(res.code != 0) {
                return res;
            }
            //console.log(res);
            this.headers.authid = res.result.authid;
            if(res.result.servers.length === 0) {
                return {
                    code: -1,
                    msg: 'jmp servers length is 0'
                }
            }
            this.headers.host = res.result.servers[0];
            return {
                code: 0,
                msg: '认证成功'
            }
        } catch (error) {
            return {
                code: -1,
                msg: error.message
            }
        }
    }

}

module.exports = Api;
