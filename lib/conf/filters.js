/**
 * Created by BenJ on 2017/6/20.
 */
"use strict";

/**
 * filter 配置
 * 以顺序决定多个filter
 * 使用的时候将key传入到routerHandle filter参数
 *
 */
module.exports = {

  checkCreateAccount: ['checkIP', 'checkUsername'],

  checkGetCode: ['checkCanPost','checkInvitationCount'],

  checkAccountManage: ['checkInvitationValid'],

  checkUseCode: ['checkUidExist','checkInvitationValid'],

  checkUidExist: ['checkUidExist'],

  checkAdmin: ['checkAuthentication', 'checkAdmin'],

  checkAuthentication: ['checkAuthentication']

};