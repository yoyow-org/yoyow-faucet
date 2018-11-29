/**
 * Created by BenJ on 2017/6/28.
 */
"use strict";

import base from './base';

class invitationCode extends base{
  constructor(){
    super();
    this.table = 'invitationCode';
    this.fields = {
      code: 'String',
      creator: 'Number',
      create_date: 'Date',
      consumer: 'Number',
      consume_date: 'Date',
      is_consume: 'Bool'
    };
  }
}

module.exports = invitationCode;