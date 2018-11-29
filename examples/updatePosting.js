/**
 * Created by xiangxn on 2017/6/19.
 */
import nodegrass from 'nodegrass';
import {aes, Signature, PrivateKey, PublicKey} from "yoyowjs-lib";

/**
 *更新发
 * 开启发帖权可配置为是否需要邀请码，如果配置为true时code参数是必须的，
 * executor为发启更新的操作者，可以是注册商也可以是平台管理员
 * enable为true时表示开启，否则表示关闭
 */

/**
 * 操作者公钥
 * @type {PublicKey}
 */
var oPkey = PublicKey.fromPublicKeyString("YYW7KCXr8KNFKhXenYNqPC9Cw187BbwZDu6Sv7UzfzDX2tFUaw1RP", "YYW");
/**
 * 操作者私钥
 * @type {string}
 */
var oKey = PrivateKey.fromWif("5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3");//5JNVDaQBpeRKYos7KCc1oLZrqLbwGsM74obxiGEh1ZFH7feCipm
var sendObj = {
    "account": 568870,
    "code": "asldkfjalsdfk",  //邀请码由水龙头统一管理，可以由作者申领后发给新用户，用来开起发帖权
    "executor": 25638,          //注册商或者平台管理员
    "options": {"can_post":true}
};

sendObj={
    "account": 512539,
    "code": "asldkfjalsdfk",
    "executor": 25997,
    "options": {"can_post":true}
}

var strObj = JSON.stringify(sendObj);

var signed = Signature.signBuffer(new Buffer(strObj), oKey);

sendObj.checksum = signed.toHex();
console.log(sendObj);

var verify = Signature.fromHex(sendObj.checksum).verifyBuffer(new Buffer(strObj), oPkey);
console.log(verify);