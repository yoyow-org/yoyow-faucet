/**
 * Created by BenJ on 2017/6/28.
 */
"use strict";

import account from './accountDAO';
import ip from './ipDAO';
import invitation from './invitationDAO';
import erc20 from "./erc20DAO";
import users from './usersDAO';
import platform from './platformDAO';
import faucetConfig from './faucetConfigDAO';
import walletConfig from './walletConfigDAO';
import authlogin from './authloginDAO';

module.exports = {
    account() {
        return new account();
    },
    config() {
        return new config();
    },
    ip() {
        return new ip();
    },
    invitation() {
        return new invitation();
    },
    erc20() {
        return new erc20();
    },
    users() {
        return new users();
    },
    platform() {
        return new platform();
    },
    faucetConfig() {
        return new faucetConfig();
    },
    walletConfig() {
        return new walletConfig();
    },
    authlogin() {
        return new authlogin();
    }
};