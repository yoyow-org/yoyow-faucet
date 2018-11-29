"use strict";

import {validation} from '../index';

module.exports = {

    resultWrapper(res, msg = '操作成功', code = 0, data = {}) {
        let result = {
            code: code,
            msg: msg,
            data: data
        };
        res.json(result);
    },

    getToday() {
        let timeArea = [],
            today = new Date(new Date().toLocaleDateString()).getTime();
        timeArea.push(today);
        timeArea.push(today + 24 * 60 * 60 * 1000);
        return timeArea;
    },

    /**
     * 解析请求参数， 需优化，传入参数拥有子对象的情况解析失败
     * @param req
     * @param callback
     */
    analyseParams(req, callback) {
        let result = '';
        if (!validation.isEmptyObject(req.body)) {
            callback(req.body);
        } else {
            req.on('data', data => {
                result += data;
            });
            req.on('end', () => {
                if (!result) callback(req.query);
                else callback(JSON.parse(result));
            });
        }
    },

    formatParams(result) {
        let resultObj = {};
        result = decodeURI(result.substring(0, result.length - 1));
        result.split('&').forEach(p => {
            let param = p.split('=');
            if (resultObj[param[0]]) {
                if (typeof(resultObj[param[0]]) == 'string') {
                    resultObj[param[0]] = [resultObj[param[0]], param[1]]
                } else {
                    resultObj[param[0]].push(param[1]);
                }
            } else {
                resultObj[param[0]] = param[1];
            }
        });
        return resultObj;
    },

    getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        return currentdate;
    },

    checkPage(page, max){
        if(page > max) page = max;
        else if(page < 1) page = 1;
        if(!validation.isNumber(page)) page = 1;
        return page;
    },

    emptyPageData(size, ...other){
        let obj = {
            page: 1,
            size: size,
            total: 0,
            totalPage: 1
        };
        if(other.length > 0){
            for(let o of other){
                if(validation.isObject(o)){
                    for(let f in o){
                        obj[f] = o[f];
                    }
                }
            }
        }

        return obj;
    }

};