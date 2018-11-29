import {TransactionBuilder, PrivateKey} from "yoyowjs-lib";
import async from "async";
import queues from "mysql-queues";
import dbHandle from "./dbHandle";
import dao from "../sql";
import tools from "./tools";

class Erc20Gateway {
    constructor() {

    }

    /**
     * 判定uid到eth地址
     * @param uid
     */
    __doBind(uid, callback) {
        dbHandle.exec(`call BindETHtoUid(?,@eth);`, [uid], (err, info) => {
            //console.log('__doBind:', info);
            if (err) {
                callback(err, null);
            } else {
                if (info.length == 2) {
                    callback(null, info[0][0].outeth);
                    return;
                }
                callback(null, null);
            }
        });
    }

    /**
     * 绑定uid到erc20的ETH地址
     * @param uid
     */
    bindETHtoUid(uid, callback) {
        this.getErc20Addr(uid, (err, result) => {
            //console.log('bindETHtoUid', result);
            if (err) {
                callback(err, null);
            } else {
                if (result && result.length > 0) {//指定的uid已经绑定过，直接返回eth地址
                    callback(null, result[0].eth);
                } else {//新绑定eth地址
                    this.__doBind(uid, (err, eth) => {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, eth);
                        }
                    });
                }
            }
        });
    }

    /**
     * 查询指定uid的erc20地址
     * @param uid
     */
    getErc20Addr(uid, callback) {
        dao.erc20().query().where(['uid', uid]).exec((err, result) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    }

    /**
     * 检查erc20地址
     * @param {*} address 
     * @param {*} callback 
     */
    checkErc20Addr(address, callback) {
        dao.erc20().query().where(['eth', address]).exec((err, result) => {
            let flag = false;
            if(!err && result && result.length == 1 && result[0].uid){
                flag = true;
            }
            callback(flag);
        });
    }

}

export default new Erc20Gateway();