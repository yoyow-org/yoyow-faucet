// import express from 'express';

import {Apis} from "yoyowjs-ws";
import {
    PrivateKey,
    PublicKey,
    ChainStore,
    AccountUtils,
    TransactionBuilder,
    Signature
} from "yoyowjs-lib";

import {
    seedHandle,
    routerHandle,
    configHandle,
    validation,
    tools,
    dao,
    transaction
} from '../lib/index';
import Gift from "../lib/utils/Gift";

let onceCreate = 0;
/**
 * 创建账户
 */
routerHandle.post('/v1/createAccount', 'checkCreateAccount', (req, res) => {
    let processDone = false;
    let account = req.JParams.account;
    if (!validation.isEmptyObject(account)) {
        seedHandle.generateSeed(seed => {

            let referrer = global.sysConf.referrer;
            let voting_account = global.sysConf.voting_account;
            let acc = account;
            let uid = AccountUtils.calculateAccountUID(seed);
            let now = Date.now();

            if (AccountUtils.validAccountUID(acc.referrer)) {
                referrer = acc.referrer;
            }
            let nPKey = PrivateKey.fromWif(global.sysConf.registrar_key);
            //验证引荐人的有效性
            let checkRef = new Promise((resolve) => {
                ChainStore.fetchAccountByUid(referrer).then(uObj => {
                    resolve((uObj.is_full_member && uObj.is_full_member === true));
                });
            });
            //验证注册商的有效性
            let checkReg = new Promise((resolve) => {
                ChainStore.fetchAccountByUid(global.sysConf.registrar).then(uObj => {
                    resolve((uObj.is_registrar && uObj.is_registrar === true));
                });
            });
            Promise.all([checkRef, checkReg]).then(allResult => {
                
                if (allResult[0] === false) {
                    tools.resultWrapper(res, '操作失败:' + referrer + "不是有效的引荐人", 1);
                    return;
                }
                if (allResult[1] === false) {
                    tools.resultWrapper(res, '操作失败:' + global.sysConf.registrar + "不是有效的注册商", 1);
                    return;
                }
                let op_data = {
                    uid: uid,
                    name: (acc.name == undefined || acc.name == null || acc.name == "") ? "yoyo" + uid : acc.name,
                    owner: {
                        weight_threshold: 1,
                        key_auths: [[acc.owner_key, 1]],
                        account_uid_auths: []
                    },
                    active: {
                        weight_threshold: 1,
                        key_auths: [[acc.active_key, 1]],
                        account_uid_auths: []
                    },
                    secondary: {
                        weight_threshold: 1,
                        key_auths: [[acc.secondary_key, 1]],
                        account_uid_auths: []
                    },
                    memo_key: acc.memo_key,
                    reg_info: {
                        registrar: global.sysConf.registrar,
                        referrer: referrer,
                        registrar_percent: global.sysConf.registrar_percent,
                        referrer_percent: global.sysConf.referrer_percent,
                        allowance_per_article: global.sysConf.allowance_per_article,
                        max_share_per_article: global.sysConf.max_share_per_article,
                        max_share_total: global.sysConf.max_share_total,
                        buyout_percent: global.sysConf.buyout_percent
                    },
                };
                let tr = new TransactionBuilder();
                tr.add_type_operation("account_create", op_data);
                tr.set_required_fees(global.sysConf.registrar, true, true).then(() => {
                    let broadcastSuccess = () => {
                        processDone = true;
                        // 临时处理主网未更新情况下，广播两种回调问题
                            let queries = [];
                            let ipQuery = dao.ip()[req.IPMethod](req.IPControl);
                            if (req.IPMethod == 'update') {
                                ipQuery.where(['ip', req.IPControl.ip]);
                            }
                            queries.push(ipQuery.getSqlParamsEntity());
                            let accountQuery = dao.account().add({
                                seed: seed,
                                uid: uid.low,
                                username: op_data.name,
                                nickname: op_data.name,
                                head_img: '',
                                is_post: false,
                                is_referrer: false,
                                is_create: false,
                                is_admin: false,
                                registrar: global.sysConf.registrar,
                                referrer: referrer,
                                create_date: now,
                                lastmodify_date: now,
                                ip: req.IPControl.ip
                            });
                            queries.push(accountQuery.getSqlParamsEntity());
                            new transaction().init().then(dbTr => {
                                dbTr.exec(queries, err => {
                                    if (err) {
                                        tools.resultWrapper(res, '操作失败：' + err.message, 2, err);
                                    } else {
                                        tools.resultWrapper(res, '操作成功', 0, uid.toNumber());
                                        Gift.doGiftYoyo(uid);//处理赠送
                                        Gift.doGiftCsaf(uid);
                                    }
                                });
                            });
                    };
                    tr.add_signer(nPKey, nPKey.toPublicKey().toPublicKeyString());
                    tr.broadcast(() => {
                        if(!processDone) broadcastSuccess();
                    }).then(() => {
                        if(!processDone) broadcastSuccess();
                    }).catch(err => tools.resultWrapper(res, '操作失败:' + err.message, 2, err));
                });
            }).catch(err => {
                tools.resultWrapper(res, '操作失败:' + err.message, 2, err);
            });
        });
    } else {
        tools.resultWrapper(res, '参数不正确', 1);
    }
});

routerHandle.get('/v1/seed', null, (req, res) => {
    seedHandle.generateSeed(seed => {
        res.end(seed + '');
    });
});

routerHandle.get('/v1/gift', null, (req, res) => {
    Gift.__checkCsafBalance();
    res.end('done');
})

// /**
//  * 账户管理：赋予/取消 发帖权限、回帖权限、评价权限
//  */
// routerHandle.post('/v1/accountManage', 'checkAccountManage', (req, res) => {
//     let params = req.JParams;
//     let checksum = params[1];
//     let pars = params[0];

//     let executor = pars.executor;
//     if (!!executor || !(AccountUtils.validAccountUID(executor))) {
//         executor = global.sysConf.registrar;
//     }
//     //获取操作者active公钥，完成数据核验
//     let active = null;
//     ChainStore.fetchAccountByUid(executor).then(uObj => {
//         if (!uObj.is_registrar) {// && !uObj.is_admin
//             //tools.resultWrapper(res, "操作失败:操作者既不是注册商也不是管理员", 1);
//             tools.resultWrapper(res, "操作失败:操作者不是注册商", 2);
//             return;
//         }
//         if (uObj.active && uObj.active.key_auths && uObj.active.key_auths.length > 0) {
//             active = uObj.active.key_auths[0][0];
//             if (active == null) {
//                 tools.resultWrapper(res, "操作失败:获取操作者公钥失败", 1);
//                 return;
//             }
//             //验证签名
//             let ePkey = PublicKey.fromPublicKeyString(active);
//             let verify = Signature.fromHex(checksum).verifyBuffer(new Buffer(JSON.stringify(pars)), ePkey);
//             if (!verify) {
//                 tools.resultWrapper(res, "操作失败:验证签名失败", 1);
//                 return;
//             }

//             let nPrivKey = global.sysConf.registrar_key;
//             let nPKey = PrivateKey.fromWif(nPrivKey);
//             let tr = new TransactionBuilder();

//             tr.add_type_operation('account_manage', {
//                 fee: {total: {amount: 1000000, asset_id: 0}},
//                 executor: global.sysConf.registrar,
//                 account: pars.account,
//                 options: pars.options,
//             });
//             tr.update_head_block().then(() => {
//                 tr.add_signer(nPKey, nPKey.toPublicKey().toPublicKeyString());
//                 console.log("serialized transaction:", tr.serialize());
//                 tr.broadcast().then((b_res) => {
//                     tools.resultWrapper(res, '操作成功', 0, b_res);
//                 }).catch((err) => {
//                     tools.resultWrapper(res, "操作失败:" + err, 1);
//                 });
//             });
//         } else {
//             tools.resultWrapper(res, "操作失败:操作都没有key_auths", 1);
//         }
//     }).catch(err => {
//         tools.resultWrapper(res, "操作失败:" + err, 2);
//     });
// });

// /**
//  * 获取账户信息
//  */
// routerHandle.get('/v1/getAccount', null, (req, res) => {
//     ChainStore.fetchAccountByUid(req.JParams.uid).then(uObj => {
//         tools.resultWrapper(res, '操作成功', 0, uObj);
//     }).catch(err => {
//         tools.resultWrapper(res, '操作失败:' + err.message, 2);
//     });
// });

// /**
//  * 获取邀请码
//  */
// routerHandle.get('/v1/getCode', 'checkGetCode', (req, res) => {
//     tools.resultWrapper(res, '操作成功', 0, req.invitationCode);
// });

// /**
//  * 请求使用邀请码
//  * (拓展 请求何种操作)
//  */
// routerHandle.post('/v1/useCode', 'checkUseCode', (req, res) => {
//     dao.invitation()
//         .update({
//             consumer: req.JParams.uid,
//             consume_date: Date.now()
//         })
//         .where(['code', req.JParams.code])
//         .exec((err, result) => {
//             if (err) tools.resultWrapper(res, '操作异常：' + err, 2);
//             else tools.resultWrapper(res);
//         });
// });

// /**
//  * 获取邀请码系列操作申请
//  */
// routerHandle.get('/v1/applyCodeList', null, (req, res) => {
//     dao.invitation().query()
//         .where(['creator', req.JParams.uid])
//         .and(['consumer', 0], true)
//         .and(['is_consume', false])
//         .exec((err, result) => {
//             tools.resultWrapper(res, '操作成功', 0, result);
//         });
// });

module.exports = routerHandle.instance();
