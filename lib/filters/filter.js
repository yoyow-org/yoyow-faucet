"use strict";
import {
    aes,
    Signature,
    PrivateKey,
    PublicKey,
    ChainStore,
    AccountUtils,
    TransactionBuilder,
} from "yoyowjs-lib";
import {
    tools,
    configHandle,
    invitation,
    dao,
    Users
} from '../index';

module.exports = {
    /**
     * 时间范围内检查ip
     */
    checkIP(req, res, next) {
        let real_ip = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
        let clientIp = real_ip.match(/\d+/g).join('.');
        let date = new Date().getTime();
        dao.ip().query().where(['ip', clientIp]).and(['ctrl', 'createAccount']).exec((err, result) => {
            // 供后面操作
            req.IPControl = {
                ip: clientIp,
                ctrl: 'createAccount',
                lastmodify: date
            };
            if (result.length == 0) {
                // 无查询结果情况 新增 让上一层操作
                req.IPMethod = 'add';
                next();
            } else {
                // 有查询结果情况
                if ((date - result[0].lastmodify) < global.sysConf.ipDue) {
                    // 超时时间内，不允许操作
                    tools.resultWrapper(res, `您操作太过频繁，请在${global.sysConf.ipDue / 1000}秒后重试`, 1)
                } else {
                    // 超时时间外，允许操作 并 修改信息
                    req.IPMethod = 'update';
                    if(result[0].count == null || result[0].count == undefined) res.IPControl.count = 0;
                    req.IPControl.count = ++result[0].count;
                    next();
                }
            }
        });
    },

    /**
     * 检查用户名唯一 创建账户
     */
    checkUsername(req, res, next) {
        dao.account().query(['seed']).where(['username', req.JParams.name])
            .exec((err, result) => {
                if (result.length == 0)
                    next();
                else
                    tools.resultWrapper(res, '用户名已存在', 1);
            });
    },

    /**
     * 检查操作用户合法性
     * 暂且未使用，结构功能未完善
     */
    checkSum(req, res, next) {
        let active;
        ChainStore.fetchAccountByUid(req.JParams.executor).then(uObj => {
            if (uObj.active && uObj.active.key_auths && uObj.active.key_auths.length > 0) {
                active = uObj.active.key_auths[0][0];
                if (!active) {
                    tools.resultWrapper(res, "操作失败:获取操作者公钥失败", 1);
                } else {
                    let ePkey = PublicKey.fromPublicKeyString(active);
                    let verify = Signature.fromHex(req.JParams.checksum).verifyBuffer(new Buffer(JSON.stringify(pars)), ePkey);
                    if (!verify) {
                        tools.resultWrapper(res, "操作失败:验证签名失败", 1);
                    } else {
                        next();
                    }
                }
            }
        });
    },

    /**
     * 检查是否为作者can_post权限
     * 考虑将所有权限用一个方法给出
     */
    checkCanPost(req, res, next) {
        ChainStore.fetchAccountByUid(req.JParams.uid).then(uObj => {
            if (uObj.can_post)
                next();
            else
                tools.resultWrapper(res, '权限不足无法操作', 1);
        }).catch(err => {
            tools.resultWrapper(res, "操作失败:" + err, 1);
        });
    },

    /**
     * 检查是否有is_admin管理员权限
     */
    // checkAdmin(req, res, next) {
    //     ChainStore.fetchAccountByUid(req.JParams.uid).then(uObj => {
    //         if (uObj.is_admin)
    //             next();
    //         else
    //             tools.resultWrapper(res, '权限不足无法操作', 1);
    //     }).catch(err => {
    //         tools.resultWrapper(res, "操作失败:" + err, 1);
    //     });
    // },

    /**
     * 检查邀请码有效性
     */
    checkInvitationValid(req, res, next) {
        // 修改post是否需要邀请码
        if (!global.sysConf.post_need_code) {
            invitation.validCode(req.JParams.code, (flag, msg) => {
                if (flag) {
                    next();
                } else {
                    tools.resultWrapper(res, msg, 1);
                }
            });
        } else {
            next();
        }

    },

    /**
     * 检查邀请码该作者当日生成的邀请码是否达到上限
     */
    checkInvitationCount(req, res, next) {
        let timeArea = tools.getToday();
        dao.invitation().query(['COUNT(code)'])
            .where(['creator', req.JParams.uid])
            .between(['AND', 'create_date', timeArea[0], timeArea[1]])
            .exec((err, result) => {
                if (err)
                    throw err;
                else {
                    if (result[0]['COUNT(code)'] < global.sysConf.invitation_count) {
                        invitation.getCode(req.JParams.uid, code => {
                            req.invitationCode = code;
                            next();
                        });
                    } else {
                        tools.resultWrapper(res, '当日邀请码数量达到上限', 1);
                    }
                }
            });
    },

    /**
     * 检查用户是否存在
     */
    checkUidExist(req, res, next) {
        dao.account().query().where(['uid', req.JParams.uid]).exec((err, result) => {
            if (result.length == 0) {
                tools.resultWrapper(res, '无效的用户', 1);
            } else {
                next();
            }
        });
    },

    /**
     * 检查登录令牌
     */
    checkAuthentication(req, res, next) {
        let {username, authentication} = req.JParams;
        Users.checkLogin(username, authentication).then( loginUser => {
            req.loginUser = loginUser;
            next();
        }).catch(e => {
            tools.resultWrapper(res, e.message, e.code);
        });
    },

    /**
     * 检查用户权限
     */
    checkAdmin(req, res, next) {
        if(req.loginUser.auth == 0){
            next();
        }else{
            tools.resultWrapper(res, '无操作权限', 3001);
        }
    }

};