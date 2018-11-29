"use strict";

class Validation {

  constructor(){}

  base(obj, vType){
    return Object.prototype.toString.call(obj) === `[object ${vType}]`;
  }

  isArray(obj){ return this.base(obj, 'Array'); }

  isFunction(obj){ return this.base(obj, 'Function'); }

  isString(obj){ return this.base(obj, 'String'); }

  isObject(obj){ return this.base(obj, 'Object'); }

  isNumber(obj){
    let n = Number(obj);
    return this.base(n, 'Number') && !isNaN(n);
  }

  isEmptyObject(obj){
    for (var t in obj)
      return false;
    return true;
  }

  isEmpty(obj){
    return obj == undefined || obj == null || obj == 'null' || obj == '' || obj.length == 0;
  }

  whatType(obj){
    let t = Object.prototype.toString.call(obj);
    return t.substring(t.indexOf(' ')+1, t.length-1);
  }

}

module.exports = new Validation();