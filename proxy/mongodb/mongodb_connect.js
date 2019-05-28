"use strict";
const config = require('config'); //加载默认数据库配置
const mongoClient = require('mongodb').MongoClient;

let client = null;

function connect(callback) {
    try {
        config.get("mongodb");
    } catch (err) {
        console.warn('mongodb not config.');
        return;
    }
    let db_name = config.get("mongodb.dbname");
    let user = config.get("mongodb.user");
    let host = config.get("mongodb.host");
    let port = config.get("mongodb.port");
    let password = config.get("mongodb.password");
    if (user.length === 0 && password.length === 0) {
        let database_url = 'mongodb://' + host + ':' + port + '/' + db_name;
        mongoClient.connect(database_url, function (err, database) {
            if (err) throw err;
            client = database;
            callback(client);
            console.log('mongodb connected');
        });
    } else {
        let database_url = 'mongodb://' + user + ':' + password + '@' + host + ':' + port + '/' + db_name;
        mongoClient.connect(database_url, function (err, database) {
            if (err) throw err;
            client = database;
            callback(client);
            console.log('mongodb connected');
        });
    }
}

exports.mongodb = function (callback) {
    if (client === null) {
        connect(callback);
    }
    return client;
};
