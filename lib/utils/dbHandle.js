"use strict";

import mysql from 'mysql';

import dbConf from '../conf/db';

class DbHandle {

    constructor() {
        if (global.dbPool == undefined || global.dbPool == null) {
            global.dbPool = mysql.createPool(dbConf);
        }
    }

    exec(sql, values, callback) {

        global.dbPool.query(sql, values, (err, result) => {
            callback(err, result);
        });

    }

    getConnection(callback) {
        global.dbPool.getConnection((err, connection) => {
            if (err) {
                callback(null);
                return;
            }
            callback(connection);
        })
    }

}

module.exports = new DbHandle();