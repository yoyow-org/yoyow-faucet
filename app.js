import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import index from './routes/index';
import api from './routes/api';
import wx from './routes/wx';
import sys from './routes/sys';
import gateway from "./routes/gateway";
import platform from "./routes/platform";
import users from "./routes/users";

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// 跨域设置
var protocols = ['http://', 'https://'];
var allowOrigin = ['localhost', '47.90.2.252', 'wallet.yoyow.org', 'demo.yoyow.org'];
app.use(function (req, res, next) {
    let origin = req.headers.origin || req.headers.referer || false;
    if (origin) {
        if (origin.endsWith("/")) origin = origin.substr(0, origin.length - 1);
        for (var ao of allowOrigin) {
            if (origin.startsWith(protocols[0] + ao) || origin.startsWith(protocols[1] + ao)) {
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Methods', 'GET,POST');
                res.header('Access-Control-Allow-Headers', 'Content-Type');
                res.header('Access-Control-Allow-Credentials', 'true');
            }
        }
    }
    console.log(req.body, '<< req.body');
    console.log(req.params, '<< req.params');
    console.log(req.query, '<< req.query');
    next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);
app.use('/sys', sys);
app.use('/gateway', gateway);
app.use('/wx', wx);
app.use('/platform', platform);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
