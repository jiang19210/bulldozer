"use strict";
let Redis = require('ioredis');
let config = require('config'); //加载默认数据库配置

let client = null;
function connect() {
    if (client === null) {
        global.HEALTH.redis = {'status' : 'DOWN'};
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
        }
    } else {
        global.HEALTH.redis = {'status' : 'UP'};
    }
    return client
}

exports.redis = function () {
    return connect();
};

exports.close = function () {
    client.disconnect();
};