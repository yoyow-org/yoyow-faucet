/**
 * Created by BenJ on 2017/6/28.
 */
"use strict";

import base from './base';

class ipInfo extends base{
  constructor(){
    super();
    this.table = 'ipInfo';
    this.fields = {
      ip: 'String',
      ctrl: 'String',
      lastmodify: 'Date',
      count: 'Number'
    };
  }
}

module.exports = ipInfo;