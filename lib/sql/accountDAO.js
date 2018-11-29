/**
 * Created by BenJ on 2017/6/28.
 */
"use strict";

import base from './base';

class account extends base{
  constructor(){
    super();
    this.table = 'account';
    this.fields = {
      seed: 'Number',
      uid: 'Number',
      username: 'String',
      nickname: 'String',
      head_img: 'String',
      is_post: 'Bool',
      is_referrer: 'Bool',
      is_create: 'Bool',
      is_admin: 'Bool',
      registrar: 'Number',
      referrer: 'Number',
      create_date: 'Date',
      lastmodify_date: 'Date',
      ip: 'String'
    };
  }
}

module.exports = account;

/* 
mysql -uroot -p faucet -e 'select username,ip from account where ip is not null order by create_date desc;' > ./accoount.log
*/