"use strict";

import base from './base';

class platform extends base{
  constructor(){
    super();
    this.table = 'platform';
    this.fields = {
      pid: 'Number',
      owner: 'Number',
      pname: 'String',
      url: 'String',
      email: 'String',
      phone: 'String',
      contact: 'String',
      status: 'Number',
      auditor: 'String',
      memo: 'String',
      create_time: 'Date',
      last_update_time: 'Date'
    };
  }
}

module.exports = platform;