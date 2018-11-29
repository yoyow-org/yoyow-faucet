import crypto from 'crypto';
import dao from '../sql/index';
import configHandle from './configHandle';
import tools from './tools';

class Account{
    constructor() {}

    getList(page, size) {
        return new Promise((resolve, reject) => {
            dao.account().query(['count(*)']).exec((err, cRes) => {
                let total = cRes[0]['count(*)'];
                let totalPage = Math.ceil(total / size);
                page = tools.checkPage(page, totalPage);
                dao.account().query().limit((page - 1) * size, size).exec((err, result) => {
                    if(result && result.length > 0){
                        resolve({page: page, size: size, data: result, total: total, totalPage: totalPage});
                    }else{
                        reject({code: 1009, message: '无查询结果', empty: tools.emptyPageData(size)});
                    }
                });
            });
        });
    }

}

export default new Account();