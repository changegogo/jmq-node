const _ = require('lodash');
const uuid = require('node-uuid');
const conf = require('../conf');
const sleep = require('../utils/sleep');

class Producer {
    constructor(api) {
        // 检测api参数是否正确 TODO
        this.api = api;
        this.status = -1;
    }
    async _pushMessages(messages) {
        if(Object.prototype.toString.call(messages) != '[object Array]') {
            return {
                code: -1,
                msg: 'messages must be Array, Please!'
            }
        }
        let data = {
            app: this.api.producer.app,
            topic: this.api.producer.topic
        }
        // 为每一条信息添加businessId
        data.messages = _.map(messages, (message) => {
            return {
                businessId: uuid.v1() .replace(/-/g, '').substring(0, 16),
                text: message
            }
        });
        let url = `http://${this.api.headers.host}/${this.api.apiVersion}/produce`;
        try {
            return await this.api.invokeHttpRequest(url, data);
        } catch (error) {
            return {
                code: -1,
                msg: error.message
            }
        }
    }

    async _auth() {
        try {
            let auth = await this.api.auth('producer');
            this.status = auth.code === 0 ? 0 : -1;
        } catch (error) {
            console.error(error);
        }
    }

    async produce(messages) {
        let maxRetryCount = conf.maxRetryCount;
        if(this.status === -1) {
            await this._auth();
        }
        let res = null;
        while(maxRetryCount-- > 0 && this.status === 0){
            res = await this._pushMessages(messages);
            if(res.code === 0) {
                break;
            }else {
                await this._auth();
                await sleep(conf.retryInterval);
            }
        }
        return res;
    }
}

module.exports = Producer;