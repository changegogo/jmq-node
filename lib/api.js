const _ = require('lodash');
const conf = require('../conf');
const req = require('request-promise');
const sleep = require('../utils/sleep');

class Api {
    constructor(params) {
        if (_.difference(conf.conParamsKeys, _.keys(params)).length != 0) {
            throw new Error('conParamsKeys is error');
        }
        this.apiVersion = conf.apiVersion;
        this.app = params.app;
        this.topic = params.topic;
        this.user = params.user;
        this.password = params.password;
        this.host = params.host;
        this.port = params.port;

        this.headers = {
            'content-type': 'application/json',
            'connection':"keep-alive",
            'user-agent': 'JMQ-javascript/1.0.1',
            'accept': 'text/plain',
            'host': params.host,
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
            timeout: 5000 * 3,
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
    async auth() {
        let data = {
            app: this.app,
            topic: this.topic,
            user: this.user,
            password: this.password
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
