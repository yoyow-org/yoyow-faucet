/**
 * Created by xiangxn on 2017/7/17.
 */
import {
    routerHandle,
    configHandle,
    validation,
    tools,
    dao
} from '../lib';
import http from "http";

routerHandle.get('/v1/proxy', null, (req, res) => {
    var code = req.JParams.code;
    var appid = "";
    var secret = "";
    var paras = "appid=" + appid + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code";
    http.get('https://api.weixin.qq.com/sns/oauth2/access_token?' + paras, function (req, res) {
        var html = '';
        req.on('data', function (data) {
            html += data;
        });
        req.on('end', function () {
            tools.resultWrapper(res, '操作成功', 0, html);
        });
        req.on("error",function (err) {
            tools.resultWrapper(res, '操作失败:'+err.message, 2);
        })
    });
});
module.exports = routerHandle.instance();