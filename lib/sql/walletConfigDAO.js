"use strict";

import base from './base';

class walletConfig extends base{
  constructor(){
    super();
    this.table = 'wallet_config';
    this.fields = {
      config_key: 'String', //配置键
      config_content: 'String', //配置值
      type: 'String', //配置值类型
      remark: 'String' //配置备注
    };
  }
}

module.exports = walletConfig;