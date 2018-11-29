"use strict";

module.exports = {

    allowance_per_article: {amount: 0, asset_id: 0}, // 每文最低收入（不参与分成收入）

    apiServer: "", // api服务器地址

    authentication_due:300000,  // 登录令牌过期时间 单位ms

    buyout_percent: 10000, // 买断价比例

    check_connect_interval:180000, // 检查ws连接间隔

    erc20byuid: '', // etc20支付网关uid

    giftYoyo: 100, // 注册时赠送的yoyo

    invitation_count: 5, // 邀请码每天限制数量

    ipDue: 30 * 1000, // ip d多少时间范围内不得操作 单位ms

    max_share_per_article: {amount: 0, asset_id: 0}, // 每文最高分成金额
    
    max_share_total: {amount: 0, asset_id: 0}, // 账户最高分成金额

    post_need_code: true, // 开启发帖权是否需要激活码

    referrer: 0, // 引荐人uid

    referrer_percent: 0, // 引荐人分成比例

    registrar: 0, // 注册商uid

    registrar_key: '', // 注册商私钥

    registrar_memo_key: "", // 注册商备注私钥

    registrar_percent: 0, // 注册商分成比例

    seed_end: 999999, //  种子区间结束
    
    seed_hold: [821001, 999999], // 种子保留

    seed_start: 821001, // 种子区间开始

    voting_account: 175, // 代理选举账号 uid

}