"use strict";
global.HEALTH = {
    'status': 'UP',
    'mysql': {'status': 'DOWN'},
    'mongodb': {'status': 'DOWN'},
    'redis': {'status': 'DOWN'}
};
var favicon = require('serve-favicon');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var routes = require('./routes/index');

var app = express();
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
