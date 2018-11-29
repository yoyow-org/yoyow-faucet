"use strict";

import base from './base';

class users extends base{
  constructor(){
    super();
    this.table = 'users';
    this.fields = {
      id: 'Number',
      username: 'String',
      password: 'String',
      auth: 'Number',
      authentication: 'String',
      memo: 'String',
      last_login_time: 'Number'
    };
  }
}

module.exports = users;