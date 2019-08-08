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
    let data = collection.data;
    let duplicate = collection.duplicate;

    if (data == null || data.length === 0) {
        callback({'error': 'insert必须包含data'});
    } else if (!Array.isArray(data)) {
        callback({'error': 'insert属性data必须为数组'});
    } else {
        let fields = [name];
        let insertFields = [];
        let a = 'INSERT INTO ?? (';
        for (let key in data[0]) {
            fields.push(key);
            insertFields.push(key);
            a += '??,';
        }
        let sql = strings.reEndComma(a, ',') + ') VALUES ';
        let values = '(';
        for (let i = 0; i < data.length; i++) {
            let pair = data[i];
            for (let j = 0; j < insertFields.length; j++) {
                let key = insertFields[j];
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
            for (let i = 0; i < duplicate.length; i++) {
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
    let data = collection.data;
    let query = collection.query;

    if (data == null) {
        callback({'error': 'update必须包含data'});
    } else if (Array.isArray(data)) {
        callback({'error': 'update属性data不可以为数组'});
    } else {
        let fields = [name];
        let sql = 'UPDATE ?? SET ';
        for (let key in data) {
            fields.push(key);
            fields.push(data[key]);
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