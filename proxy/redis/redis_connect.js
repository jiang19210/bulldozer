"use strict";
let Redis = require('ioredis');
let config = require('config'); //加载默认数据库配置

let client = null;

function connect() {
    let cluster_config = null;
    try {
        cluster_config = config.get('redis.cluster');
    } catch (err) {
        console.warn('redis cluster config error, %s', err)
    }
    if (cluster_config) {
        client = new Redis.Cluster(cluster_config);
        console.log('redis connected by cluster');
    } else {
        let host = config.get('redis.host');
        let port = config.get('redis.port');
        client = new Redis(port, host);
        console.log('redis connected');
    }
    if (client === null) {
        throw new Error('redis connect fail')
    } else {
        client.on('error', function (err) {
            console.error('redis连接发生异常.%s', err);
        })
    }
    return client
}

exports.redis = function () {
    if (client === null) {
        connect();
    }
    return client;
};

exports.close = function () {
    client.disconnect();
};