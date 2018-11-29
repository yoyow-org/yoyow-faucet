"use strict";

import {
    routerHandle, 
    configHandle, 
    tools, 
    validation,
    Platform,
    seedHandle
 } from '../lib/index';

/**
 * 申请平台
 */
routerHandle.post('/apply', null, (req, res) => {
  Platform.apply(req.JParams).then( () => {
    tools.resultWrapper(res);
  }).catch(e => {
    tools.resultWrapper(res, e.message, e.code);
  });
});


/**
 * 获取平台列表
 */
routerHandle.get('/getList', 'checkAuthentication', (req, res) => {
  let {head, page, size} = req.body;
  Platform.getList(head, page, size).then( result => {
    tools.resultWrapper(res, '操作成功', 0, result);
  }).catch(e => {
    tools.resultWrapper(res, e.message, e.code, e.empty);
  });
});

/**
 * 根据平台id查询平台
 */
routerHandle.get('/getByPid', null, (req, res) => {
  let {pid} = req.JParams;
  Platform.getByPid(pid).then( p => {
    tools.resultWrapper(res, '操作成功', 0, p);
  }).catch(e => {
    tools.resultWrapper(res, e.message, e.code);
  });
});

/**
 * 审核平台
 */
routerHandle.post('/audit', 'checkAuthentication', (req, res) => {
  let {pid, audit} = req.JParams;
  Platform.auditPlatform(req.loginUser, pid, audit).then(() => {
    tools.resultWrapper(res);
  }).catch(e => {
    tools.resultWrapper(res, e.message, e.code);
  });
});

module.exports = routerHandle.instance();