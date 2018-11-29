/**
 * Created by BenJ on 2017/6/22.
 */
"use strict";

import dao from '../sql/index';
import validation from './validation';

let generateCode = () => {
  let source = '23456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    code = '';
  for(let i=0; i<6; i++){
    code += source[Math.floor(Math.random() * source.length)];
  }
  return code;
};

module.exports = {

  getCode(uid, callback){
    let code = generateCode();
    dao.invitation().query().where(['code',code]).exec((err, result) => {
      if(result.length == 0){
        dao.invitation().add({
          code: code,
          creator: uid,
          create_date: Date.now()
        }).exec((err, result) => {
          callback(code);
        });
      }else{
        this.getCode(uid, callback);
      }
    });
  },

  validCode(code, callback){
    dao.invitation().query().where(['code', code]).exec( (err, result) => {
      console.log(result);
      if(err)
        throw err;
      else if(result.length == 0)
        callback(false, '无效的邀请码');
      else if(result[0].is_consume == 1 || !validation.isEmpty(result[0].consumer))
        // 新增 若消费者存在 ，消费状态为未消费的情况，此为已申请使用，所以不可再次使用
        callback(false, '已使用的邀请码');
      else{
        callback(true);
      }
    });
  }

};