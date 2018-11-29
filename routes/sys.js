/**
 * Created by BenJ on 2017/7/17.
 */
"use strict";

import {routerHandle, configHandle, tools, validation, seedHandle, Account} from '../lib/index';

/**
 * 获取配置 键值对象
 */
// routerHandle.get('/sysConf/get', 'checkAuthentication', (req, res) => {
//   configHandle.getConf(req.JParams.key, (result) => {
//     tools.resultWrapper(res, '操作成功', 0, result);
//   });
// });

/**
 * 获取配置List
 */
routerHandle.get('/sysConf/list', 'checkAuthentication', (req, res) => {
  let {type, page, size} = req.body;
  configHandle.getAll(type, page, size).then(result => {
    tools.resultWrapper(res, '操作成功', 0, result);
  }).catch(e => {
    tools.resultWrapper(res, e.message, e.code, e.empty);
  });
});

/**
 * 获取钱包配置
 */
routerHandle.get('/sysConf/walletConfigs', null, (req, res) => {
  configHandle.getConf(null, 1, (result) => {
    tools.resultWrapper(res, '操作成功', 0, result);
  });
});

/**
 * 新增配置
 */
routerHandle.post('/sysConf/add', 'checkAdmin', (req, res) => {
  let {configKey, configVal, configType, configScope, configMemo} = req.JParams;
    configHandle.writeConf(configKey, configVal, configType, configScope, configMemo, (err) => {
      if (err) {
        let msg = err.message;
        if(msg.indexOf('ER_DUP_ENTRY') >= 0) msg = '配置键已存在';
        tools.resultWrapper(res, '操作失败：' + msg, 2);
      } else {
        tools.resultWrapper(res);
      }
    });
});

/**
 * 修改配置
 */
routerHandle.post('/sysConf/upd', 'checkAdmin', (req, res) => {
  let {configKey , configVal , configType, configScope, configMemo} = req.JParams;
  configHandle.updateConf(configKey, configVal, configType, configScope, configMemo, (err) => {
    if (err) {
      tools.resultWrapper(res, '操作失败：' + err, 2);
    } else {
      tools.resultWrapper(res);
    }
  });
});

/**
 * 删除配置
 */
routerHandle.post('/sysConf/del', 'checkAdmin', (req, res) => {
  configHandle.deleteConf(req.JParams.configKey, req.JParams.configScope, (err) => {
    if (err) {
      tools.resultWrapper(res, '操作失败：' + err, 2, req.JParams);
    } else {
      tools.resultWrapper(res);
    }
  });
});

/**
 * 获取系统账户列表
 */
routerHandle.get('/account/list', null, (req, res) => {
  let {page, size} = req.body;
  Account.getList(page, size).then(result => {
    tools.resultWrapper(res, '操作成功', 0, result);
  }).catch(e => {
    tools.resultWrapper(res, e.message, e.code, e.empty);
  });
});

module.exports = routerHandle.instance();

