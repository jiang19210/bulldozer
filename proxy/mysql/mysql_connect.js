"use strict";
const mysql = require('mysql');
const config = require('config'); //加载默认数据库配置
const debug = require('debug')('spider:server:mysql');

try {
    console.log(config.get('mysql.host') + ':' + config.get('mysql.port') + '/' + config.get('mysql.database'))
} catch (err) {
    console.warn("mysql not config");
    return;
}
let pool  = mysql.createPool({
    connectionLimit : config.get('mysql.connectionLimit'),
    host            : config.get('mysql.host'),
    user            : config.get('mysql.user'),
    password        : config.get('mysql.password'),
    port        : config.get('mysql.port'),
    database        : config.get('mysql.database')
});
pool.on('acquire', function (connection) {
    debug('Connection %d acquired', connection.threadId);
});
pool.on('connection', function (connection) {
    console.log('连接池建立新连接')
});
pool.on('enqueue', function () {
    console.log('等待可用连接');
});
pool.on('release', function (connection) {
    debug('Connection %d released', connection.threadId);
});
pool.on('error', function (err) {
    console.error('mysql连接发生异常.%s', err);
});
module.exports = pool;