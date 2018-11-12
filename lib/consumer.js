const _ = require('lodash');
const conf = require('../conf');
const sleep = require('../utils/sleep');

class Consumer {
    constructor(api) {
        this.api = api;
        this.status = -1;
    }

    async _auth() {
        try {
            let auth = await this.api.auth('consumer');
            this.status = auth.code === 0 ? 0 : -1;
        } catch (error) {
            console.error(error);
        }
    }
    // 从服务器拉取消息
    async _fetchMessages() {
        let data = {
            app: this.api.consumer.app,
            topic: this.api.consumer.topic
        }
        let url = `http://${this.api.headers.host}/${this.api.apiVersion}/consume`;
        try {
            return await this.api.invokeHttpRequest(url, data);
        } catch (error) {
            return {
                code: -1,
                msg: error.message
            }
        }
    }
    // 消费消息
    async consume() {
        let maxRetryCount = conf.maxRetryCount;
        if(this.status === -1) {
            await this._auth();
        }
        let res = null;
        while(maxRetryCount-- > 0 && this.status === 0) {
            res = await this._fetchMessages();
            if(res.code === 0) {
                break;
            }
            await this._auth();
            await sleep(conf.retryInterval);
        }
        return res;
    }

    // 构造重试数据
    _createJmpData(info, exception) {
        let data = _.pick(info, conf.pickData);
        data.locations = _.map(info.messages, message => {
            return _.pick(message, conf.pickLocations);
        });
        if(exception) data.exception = exception;
        return data;
    }

    async _ackMessage(info) {
        let url = `http://${this.api.headers.host}/${this.api.apiVersion}/ack`;
        try {
            let data =  this._createJmpData(info);
            return await this.api.invokeHttpRequest(url, data);
        } catch (error) {
            return {
                code: -1,
                msg: error.message
            }
        }
    }

    // 确认消费回复
    async ack(info) {
        if (!('messages' in info)) {
            throw new Error('ack messages is null');
        }
        if(this.status === -1) {
            await this._auth();
        }
        let maxRetryCount = conf.maxRetryCount;
        let ackRes = null;
        while(maxRetryCount-- > 0 && this.status === 0) {
            ackRes = await this._ackMessage(info);
            if(ackRes.code === 0){
                break;
            }
            await this._auth();
            await sleep(conf.retryInterval);
        }
        return ackRes;
    }

    async _retryMessages(info, exception) {
        let url = `http://${this.api.headers.host}/${this.api.apiVersion}/retry`;
        try {
            let data =  this._createJmpData(info, exception);
            return await this.api.invokeHttpRequest(url, data);
        } catch (error) {
            return {
                code: -1,
                msg: error.message
            }
        }
    }

    // 重试消息
    async retry(info, exception) {
        if (!('messages' in info)) {
            throw new Error('ack messages is null');
        }
        let maxRetryCount = conf.maxRetryCount;
        let retryRes = null;
        while(maxRetryCount-- > 0 && this.status === 0) {
            retryRes = await this._retryMessages(info, exception);
            if(retryRes.code === 0) {
                break;
            }
            await this._auth();
            await sleep(conf.retryInterval);
        }
        return retryRes;
    }
}

module.exports = Consumer;