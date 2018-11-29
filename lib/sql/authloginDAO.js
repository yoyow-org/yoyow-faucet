"use strict";

import base from './base';

class authlogin extends base{
  constructor(){
    super();
    this.table = 'authlogin';
    this.fields = {
      id: 'Number',
      yoyow: 'Number',
      time: 'Number',
      sign: 'String',
      state: 'String'
    };
  }
}

module.exports = authlogin;