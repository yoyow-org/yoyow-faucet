import crypto from 'crypto';
import dao from '../sql/index';
import tools from './tools';
import configHandle from './configHandle';
import {
    aes,
    Signature,
    PrivateKey,
    PublicKey,
    ChainStore,
    AccountUtils
} from "yoyowjs-lib";
import {Apis} from "yoyowjs-ws";
import { platform } from 'os';
import { validation } from '../index';

class Platform{
    constructor() {}

    __generatePid(callback) {
        let pid = Math.random() * 100000;
        pid = AccountUtils.calculateAccountUID(pid);
        dao.platform().query(['pid']).where(['pid', pid]).exec((err, result) => {
            if(result && result.length > 0){
                this.generateSeed(callback);
            }else{
                callback(pid);
            }
        });
    }

    apply(platformData) {
        return new Promise((resolve, reject) => {
            if(!platformData.owner || !AccountUtils.validAccountUID(platformData.owner)){
                reject({code: 1006, message: '无效的YOYOW账户'});
                return;
            }
            Apis.instance().db_api().exec("get_accounts_by_uid", [[platformData.owner]]).then(acc => {
                if(acc && acc.length > 0 && acc[0] != null){
                        let now = Date.now();
                        platformData.pid = platformData.owner;
                        platformData.status = 0;
                        platformData.create_time = now;
                        platformData.last_update_time = now;
                        dao.platform().add(platformData).exec((err, result) => {
                            if(!err){
                                resolve(0);
                            }else{
                                console.log(err);
                                if(err.message.indexOf('Duplicate entry ')){
                                    reject({code: 1010, message: '该YOYOW账户已注册过平台商'});
                                }else{
                                    reject({code: 1007, message: '操作失败'});
                                }
                            }
                        });
                }else{
                    reject({code: 1006, message: '无效的YOYOW账户'});
                }
            });
        });
    }

    getByPid(pid) {
        return new Promise((resolve, reject) => {
            Apis.instance().db_api().exec("get_platform_by_account", [pid]).then(platform => {
                if(platform){
                    Apis.instance().db_api().exec("get_accounts_by_uid", [[platform.owner]]).then( acc => {
                        platform.owner = {
                            uid: acc[0].uid,
                            owner_pk: acc[0].owner.key_auths[0][0],
                            active_pk: acc[0].active.key_auths[0][0],
                            secondary_pk: acc[0].secondary.key_auths[0][0]
                        }
                        resolve(platform);
                    })
                }else{
                    reject({code: 1007, message: '无效的pid'});
                }
            }).catch(e => {
                reject({code: 1000, message: '操作失败：'+e.message});
            });
        });
    }

    __checkType(type){
        if(0 != type && 1 != type) return undefined;
        return type;
    }

    getList(head, page, size) {
        return new Promise((resolve, reject) => {
            Apis.instance().db_api().exec("get_platform_count", []).then(count => {
                let totalPage = Math.ceil(count / size);
                let total = count;
                // 第一个元素为上一页标示
                // 最后一个元素为下一页标示
                let actualSize = Number(size) + 1;
                if(page < 1) page = 1;
                if(page > totalPage) page = totalPage;
                if(!head) head = 0;
                Apis.instance().db_api().exec("lookup_platforms", [head, actualSize, 2]).then(list => {
                    if(list.length < actualSize) 
                        head = list[list.length - 1].owner;
                    else 
                        head = list.pop().owner;
                    resolve({page, size, totalPage, total, list, head});
                }).catch(e => {
                    reject(e);
                });
            })
        });
    }

    auditPlatform(loginUser, pid, audit) {
        return new Promise((resolve, reject) => {
            let query = dao.platform();
            if(audit == 1){
                query.update({status: 1, auditor: loginUser.username, last_update_time: Date.now()}).where(['pid', pid]);
            }else{
                query.delete().where(['pid', pid]);
            }
            query.exec((err, result) => {
                if(!err){
                    resolve(0);
                }else{
                    reject({code: 1009, message: err.message});
                }
            });
        })
    }

}

export default new Platform();