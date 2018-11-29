import crypto from 'crypto';
import dao from '../sql/index';
import configHandle from './configHandle';
import tools from './tools';

class Users{
    constructor() {}

    __hamc(text){
        let hmac = crypto.createHmac('sha256', 'ARTOM TIANZI CHAOTIANMEN ISAAC LATE SHIFT');
        hmac.update(text);
        return hmac.digest('hex');
    }

    login(username, password){
        return new Promise((resolve, reject) => {
            password = this.__hamc(password);
            dao.users().query().where(['username', username]).and(['password', password]).exec((err, result) => {
                if(result && result.length > 0){
                    let now = Date.now();
                    let hash = crypto.createHash('md5');
                    hash.update(username + password + now);
                    let authentication = hash.digest('hex');
                    dao.users()
                    .update({ authentication: authentication, last_login_time: now })
                    .where(['username', username])
                    .and(['password', password])
                    .exec((err, result) => {
                        if(err){
                            reject(1002);
                        }else{
                            resolve(authentication);
                        }
                    });
                }else{
                    reject(1001);
                }
            });

        });
    }

    checkLogin(username, authentication){
        return new Promise((resolve, reject) => {
            dao.users().query(['username','auth','memo','authentication','last_login_time']).where(['username', username]).and(['authentication', authentication]).exec((err, result) => {
                if(result && result.length > 0){
                    let now = Date.now();
                    let elapsed = now - parseInt(result[0].last_login_time);
                    if(elapsed < global.sysConf.authentication_due){
                        resolve(result[0]);
                    }else{
                        reject({code: 1003, message: '登录超时'});
                    }
                }else{
                    reject({code: 1004, message: '登录已失效'});
                }
            });
        });
    }

    checkUsername(username){
        return new Promise((resolve, reject) => {
            dao.users().query(['id']).where(['username',username]).exec((err, result) => {
                if(result){
                    if(result.length > 0) {
                        reject({code: 1012, message: '用户名已存在'});
                    }else{
                        resolve(0);
                    }
                }else{
                    reject({code: 1013, message: '系统错误'});
                }
            });
        });
    }

    addUser(user){
        return new Promise((resolve, reject) => {
            user.password = this.__hamc(user.password);
            dao.users().add(user).exec((err, result) => {
                if(!err){
                    resolve(0);
                }else{
                    console.log(err.message);
                    reject({code: 1011, message: '操作失败'});
                }
            });
        });
    }

    updateUser(user){
        return new Promise((resolve, reject) => {
            user.password = this.__hamc(user.password);
            dao.users().update(user).where(['id',user.id]).exec((err, result) => {
                if(!err){
                    resolve(0);
                }else{
                    console.log(err.message);
                    reject({code: 1011, message: '操作失败'});
                }
            });
        });
    }

    deleteUser(id){
        return new Promise((resolve, reject) => {
            dao.users().delete().where(['id', id]).exec((err, result) => {
                if(!err){
                    resolve(0);
                }else{
                    console.log(err.message);
                    reject({code: 1011, message: '操作失败'});
                }
            });
        });
    }

    getUsers(page, size){
        return new Promise((resolve, reject) => {
            dao.users().query(['count(*)']).exec((err, cRes) => {
                let total = cRes[0]['count(*)'];
                let totalPage = Math.ceil(total / size);
                page = tools.checkPage(page, totalPage);
                dao.users().query().limit((page - 1) * size, size).exec((err, result) => {
                    if(result && result.length > 0){
                        resolve({page: page, size: size, data: result, total: total, totalPage: totalPage});
                    }else{
                        reject({code: 1009, message: '无查询结果', empty: tools.emptyPageData(size)});
                    }
                });
            });
        });
    }

    getUser(id){
        return new Promise((resolve, reject) => {
            dao.users().query().where(['id', id]).exec((err, result) => {
                if(result && result.length > 0){
                    resolve(result[0]);
                }
            })
        });
    }

}

export default new Users();