"use strict";

import {
    routerHandle,
    configHandle,
    tools,
    validation,
    seedHandle,
    Users
} from '../lib/index';

routerHandle.post('/login', null, (req, res) => {
    let {
        username,
        password
    } = req.JParams;
    let msg = '系统错误，请稍后再试';
    if (username && password) {
        Users.login(username, password).then(authentication => {
            configHandle.init().then((config) => {
                tools.resultWrapper(res, msg, 0, {authentication: authentication, authentication_due: config.authentication_due});
            }).catch(e => {
                tools.resultWrapper(res, msg, 2000);
            });
            
        }).catch(code => {
            if (code == 1001) msg = '无效的用户名或密码';
            tools.resultWrapper(res, msg, code);
        });
    } else {
        if (validation.isEmpty(username)) msg = '用户名不能为空';
        else if (validation.isEmpty(password)) msg = '密码不能为空';
        tools.resultWrapper(res, msg, 2003);
    }

});

routerHandle.post('/checkLogin', 'checkAuthentication', (req, res) => {
    if(req.loginUser) tools.resultWrapper(res, 'ok', 0);
});

routerHandle.get('/getUsers', 'checkAuthentication', (req, res) => {
    let {page, size} = req.JParams;
    Users.getUsers(page, size).then(result => {
        tools.resultWrapper(res, '操作成功', 0, result);
    }).catch(e => {
        tools.resultWrapper(res, e.message, e.code, e.empty);
    });
});

routerHandle.post('/add', 'checkAdmin', (req, res) => {
    let {sysUsername, password, memo} = req.JParams;
    let user = {
        username: sysUsername,
        password: password,
        auth: 1,
        memo: memo
    };
    Users.checkUsername(sysUsername).then(() => {
        Users.addUser(user).then(() => {
            tools.resultWrapper(res);
        }).catch(e1 => {
            tools.resultWrapper(res, e1.message, e1.code);
        });
    }).catch(e2 => {
        tools.resultWrapper(res, e2.message, e2.code);
    })
});

routerHandle.post('/upd', 'checkAdmin', (req, res) => {
    let {id, password, memo} = req.JParams;
    let user = {
        id: id,
        password: password,
        memo: memo
    };
    Users.updateUser(user).then(() => {
        tools.resultWrapper(res);
    }).catch(e => {
        tools.resultWrapper(res, e.message, e.code);
    });
});

routerHandle.post('/del', 'checkAdmin', (req, res) => {
    let {id} = req.JParams;

    Users.getUser(id).then(user => {
        if(user.auth == 0){
            tools.resultWrapper(res, '管理员账户不能被删除', 2);
        }else{
            Users.deleteUser(id).then(() => {
                tools.resultWrapper(res);
            }).catch(e => {
                tools.resultWrapper(res, e.message, e.code);
            });
        }
    })
});

module.exports = routerHandle.instance();