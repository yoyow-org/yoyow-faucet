/**
 * Created by BenJ on 2017/6/20.
 */
"use strict";

import {Apis} from "yoyowjs-ws";
import {ChainStore} from "yoyowjs-lib";
import express from 'express';
import tools from '../utils/tools';

import {
    filters,
    filterConf,
    validation
} from '../index';

let router = express.Router();

module.exports = {

    build(url, filter, method, callback) {
        let filterArr = [this.checkWS, this.analyseParams];
        if (filter != null) {
            if (!filterConf[filter]) {
                throw 'invalid filter string';
            } else {
                for (let f of filterConf[filter]) {
                    filterArr.push(filters[f]);
                }
            }
        }
        router[method](url, filterArr, callback);
    },

    get(url, filter, callback) {
        this.build(url, filter, 'get', callback);
    },

    post(url, filter, callback) {
        this.build(url, filter, 'post', callback);
    },

    /**
     * 检查APIS ws是否开启
     */
    checkWS(req, res, next) {
        if (!global.Apis || global.Apis.ws_rpc == null || global.Apis.ws_rpc.ws.readyState == 3) {
            Apis.instance(global.sysConf.apiServer, true).init_promise.then((result) => {
                ChainStore.init().then(() => {
                    global.Apis = Apis.instance();
                    next();
                });
            }).catch(err => {
                tools.resultWrapper(res, '初始化全局Apis异常', 1);
            });
        } else {
            next();
        }
    },

    /**
     * 解析参数
     */
    analyseParams(req, res, next) {
        tools.analyseParams(req, (params) => {
            req.JParams = params;
            next();
        });
    },

    instance() {
        return router;
    }

};