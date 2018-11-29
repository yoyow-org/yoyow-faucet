/**
 * Created by BenJ on 2017/6/28.
 */
"use strict";

import validation from '../utils/validation';
import dbHandle from '../utils/dbHandle';

/**
 *
 * @param curBase 当前DAO对象数据
 * @param ebm 表达式
 * @param cd 操作数据 [键 值]
 * @param m 非操作 默认不传为 等于操作
 */
let where = (curBase, ebm, cd, m) => {
    if (!cd) {
        return;
    }
    let n = curBase.sql.indexOf('WHERE') < 0;
    if (n) {
        if (cd[1] == null) {
            curBase.sql += ` WHERE ${cd[0]} ${m ? 'is not null' : 'is null'}`;
        } else {
            curBase.sql += ` WHERE ${cd[0]}${m ? '!' : ''}=?`;
        }
    } else if (ebm != 'WHERE') {
        if (cd[1] == null) {
            curBase.sql += ` ${ebm} ${cd[0]} ${m ? 'is not null' : 'is null'}`;
        } else {
            curBase.sql += ` ${ebm} ${cd[0]}${m ? '!' : ''}=?`;
        }
    }
    if (cd[1] != null)
        curBase.values.push(cd[1]);
};

class base {

    constructor() {
        this.sql = '';
        this.values = [];
    }

    /**
     *
     * @param arr 字段名数组 为空情况查询全部
     * @returns {base}
     */
    query(arr) {
        let fields;
        if (validation.isEmpty(arr)) {
            let temp = [];
            for (let f in this.fields) {
                temp.push(f);
            }
            fields = temp.toString();
        } else {
            fields = arr.toString();
        }
        this.sql = `SELECT ${fields} FROM ${this.table}`;
        return this;
    }

    update(obj) {
        let sets,
            temp = [];
        for (let f in obj) {
            temp.push(`${f}=?`);
            this.values.push(obj[f]);
        }
        sets = temp.toString();
        this.sql = `UPDATE ${this.table} set ${sets}`;
        return this;
    }

    delete() {
        this.sql = `DELETE FROM ${this.table}`;
        return this;
    }

    add(obj) {
        let fields,
            vals,
            temp = [],
            tempV = [];
        for (let f in obj) {
            temp.push(f);
            tempV.push('?');
            this.values.push(obj[f]);
        }
        fields = temp.toString();
        vals = tempV.toString();
        this.sql = `INSERT INTO ${this.table}(${fields}) VALUES(${vals})`;
        return this;
    }

    where(cd, m) {
        where(this, 'WHERE', cd, m);
        return this;
    }

    and(cd, m) {
        where(this, 'AND', cd, m);
        return this;
    }

    or(cd, m) {
        where(this, 'OR', cd, m);
        return this;
    }

    /**
     * @param cd ['and.. or..','字段','val1','val2']
     * @returns {base}
     */
    between(cd) {
        if (this.sql.indexOf('WHERE') < 0) {
            this.sql += ` WHERE `;
        } else {
            this.sql += ` ${cd[0]} `
        }
        this.sql += `${cd[1]} BETWEEN ? AND ?`;
        this.values.push(cd[2]);
        this.values.push(cd[3]);
        return this;
    }

    orderBy(field, rule = 'DESC') {
        this.sql += ` ORDER BY ${field} ${rule}`;
        return this;
    }

    limit(start, length) {
        this.sql += ` LIMIT ${start}`;
        if (length > 0) this.sql += `,${length}`;
        return this;
    }

    exec(callback) {
        console.log('exec sql:' + this.sql);
        console.log('exec values:');
        console.log(this.values);
        dbHandle.exec(this.sql, this.values, callback);
    }

    getSqlParamsEntity(){
        return {sql: this.sql, params: this.values};
    }

}

module.exports = base;