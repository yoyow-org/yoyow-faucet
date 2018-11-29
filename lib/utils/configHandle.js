/**
 * Created by BenJ on 2017/6/22.
 */
"use strict";

import {Apis} from 'yoyowjs-ws';
import validation from './validation';
import tools from './tools';
import dao from '../sql/index';
import fauectConf from '../conf/faucet_conf';
import walletConf from '../conf/wallet_conf';

let configHandle = {

    __configQuery(scope) {
        let query = null;
        scope = parseInt(scope);
        switch (scope){
            case 1:
                query = dao.walletConfig();
                break;
            default:
                query = dao.faucetConfig();
                break;
        }
        return query;
    },

    __configFile(scope){
        let conf = {};
        scope = parseInt(scope);
        switch (scope){
            case 1:
            conf = walletConf;
            break;
        default:
            conf = fauectConf;
            break;
        }
        return conf;
    },

    writeConf(key, content, type, scope, remark, callback) {
        let _content = validation.whatType(content) == 'String' ? content : JSON.stringify(content);
        let query = this.__configQuery(scope);
        query.add({
            config_key: key,
            config_content: _content,
            type: type,
            remark: remark
        }).exec(callback);
    },

    updateConf(key, content, type, scope, remark, callback) {
        let _content = validation.whatType(content) == 'String' ? content : JSON.stringify(content);
        let query = this.__configQuery(scope);
        query.update({
            config_content: _content,
            type: type,
            remark: remark
        })
            .where(['config_key', key])
            .exec(callback);
    },

    deleteConf(key, scope, callback) {
        let query = this.__configQuery(scope);
        query.delete().where(['config_key', key]).exec(callback);
    },

    getConf(key, scope, callback) {
        let query = this.__configQuery(scope).query();
        if (!validation.isEmpty(key)) {
            query.where(['config_key', key])
        }
        query.exec((err, result) => {
            if (err) {
                console.log("configHandle error:", err);
                console.log("configHandle Will use the file configuration");
                callback(this.__configFile(scope));
                return;
            }
            let conf = {};
            for (let res of result) {
                let content = res.config_content;
                if (res.type == 'Array' || res.type == 'Object') {
                    content = JSON.parse(res.config_content);
                } else if (res.type == 'Number') {
                    content = Number(res.config_content);
                }
                conf[res.config_key] = content;
            }
            callback(conf);
        });
    },

    __checkScope(scope){
        // 默认查询水龙头配置
        if(0 != scope && 1 != scope) return 0;
        return scope;
    },

    getAll(scope, page, size){
        return new Promise((resolve, reject) => {
            scope = this.__checkScope(scope);
            let countQuery = this.__configQuery(scope).query(['count(*)']);
            countQuery.exec((err, cRes) => {
                if(err) {
                    reject(this.__getAllError(err.message, scope, size));
                    return;
                }
                let total = cRes[0]['count(*)'];
                let totalPage = Math.ceil(total / size);
                page = tools.checkPage(page, totalPage);
                let query = this.__configQuery(scope).query();
                query.limit((page - 1) * size, size).exec((qErr, result) => {
                    if(qErr) {
                        reject(this.__getAllError(qErr.message, scope, size));
                    }else if(result && result.length > 0){
                        resolve({type: scope, page: page, size: size, data: result, total: total, totalPage: totalPage});
                    }else{
                        reject(this.__getAllError('无查询结果', scope, size));
                    }
                });
            });
        });
    },

    __getAllError(message, scope, size){
        let rObj = tools.emptyPageData(size);
        rObj.type = scope;
        return {code: 1010, message: message, empty: rObj};
    },

    init() {
        // 实时更新配置
        return new Promise(resolve => {
            this.getConf(null, 0, (result) => {
                global.sysConf = result;
                resolve(result);
            });
        });
    }
};

/**
 * 用全局方式 给予配置
 * 使用的时候将模块引入 该模块的全局对象才有效
 * 新增 获取参数后 设置api实例
 */
/*
if (!global.sysConf) {
    configHandle.getConf(null, (result) => {
        global.sysConf = result;
    });
}
*/

module.exports = configHandle;