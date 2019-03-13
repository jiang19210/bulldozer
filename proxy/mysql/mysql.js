"use strict";
const pool = require('./mysql_connect');
const mysql = require('mysql');
const debug = require('debug')('bulldozer:mysql');
const strings = require('../../lib/strings');

exports.select = function (collection, callback) {
    let query = collection.query;
    let name = collection.name;
    let fields = [name];

    let sql = "SELECT * FROM ??";
    if (query) {
        sql += ' WHERE ';
        let flag = true;
        for (let key in query) {
            fields.push(key);
            fields.push(query[key]);
            if (flag) {
                flag = false;
                sql += ' ?? = ? ';
            } else {
                sql += ' AND ?? = ? ';
            }
        }
    }
    sql = mysql.format(sql, fields);
    if (collection.sort) {
        sql += ' ORDER BY ' + collection.sort
    }
    if (collection.limit) {
        sql += ' LIMIT ' + collection.limit;
    }
    debug('operate of select sql : %s', sql);
    pool.query(sql, callback);
};

exports.insert = function (collection, callback) {
    let name = collection.name;
    let $set = collection.$set;
    let duplicate = collection.duplicate;

    if ($set == null || $set.length === 0) {
        callback({'error': 'insert必须包含$set'});
    } else if (!Array.isArray($set)) {
        callback({'error': 'insert属性$set必须为数组'});
    } else {
        let fields = [name];
        let a = 'INSERT INTO ?? (';
        for (let key in $set[0]) {
            fields.push(key);
            a += '??,';
        }
        let sql = strings.reEndComma(a, ',') + ') VALUES ';
        var values = '(';
        for (let i = 0; i < $set.length; i++) {
            let pair = $set[i];
            for (let key in pair) {
                fields.push(pair[key]);
                values += '?,';
            }
            values = strings.reEndComma(values, ',') + '),';
            sql += values;
            values = '(';
        }
        if (duplicate) {
            sql = strings.reEndComma(sql, ',');
            sql += ' ON DUPLICATE KEY UPDATE ';
            for (var i = 0; i < duplicate.length; i++) {
                sql += duplicate[i] + '=VALUES(' + duplicate[i] + '),';
            }
        }
        sql = strings.reEndComma(sql, ',');
        sql = mysql.format(sql, fields);
        debug('operate of insert sql : %s', sql);
        pool.query(sql, callback);
    }
};

exports.update = function (collection, callback) {
    let name = collection.name;
    let $set = collection.$set;
    let query = collection.query;

    if ($set == null) {
        callback({'error': 'update必须包含$set'});
    } else if (Array.isArray($set)) {
        callback({'error': 'update属性$set不可以为数组'});
    } else {
        let fields = [name];
        let sql = 'UPDATE ?? SET ';
        for (let key in $set) {
            fields.push(key);
            fields.push($set[key]);
            sql += ' ?? = ? ,';
        }
        sql = strings.reEndComma(sql, ',');
        if (query) {
            let flag = true;
            sql += ' WHERE ';
            for (let key in query) {
                fields.push(key);
                fields.push(query[key]);
                if (flag) {
                    flag = false;
                    sql += ' ?? = ? ';
                } else {
                    sql += ' AND ?? = ? ';
                }
            }
        }
        sql = mysql.format(sql, fields);
        debug('operate of update sql : %s', sql);
        pool.query(sql, callback);
    }
};