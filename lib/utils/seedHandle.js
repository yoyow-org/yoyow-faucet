/**
 * Created by BenJ on 2017/6/24.
 */
"use strict";

import dao from '../sql/index';

module.exports = {

    generateSeed(callback) {
        let seedHold = global.sysConf.seed_hold;
        let seed = Math.floor(Math.random() * (global.sysConf.seed_end - global.sysConf.seed_start) + global.sysConf.seed_start);

        for (let i = 0; i < seedHold.length; i++) {
            if (seedHold[i] == seed) {
                this.generateSeed(callback);
                return;
            }
        }

        dao.account().query(['seed']).where(['seed', seed]).exec((err, result) => {
            if (result && result.length > 0) {
                this.generateSeed(callback);
            } else {
                callback(seed);
            }
        })
    },
};