"use strict";
const pool = require('./mysql_connect');
const mysql = require('mysql');
const debug = require('debug')('bulldozer:mysql');
const strings = require('../../lib/strings');
let separator = '#@#@#';

exports.select = function (collection, callback) {
    collection.operate = 'select';
    let arr = init_mysql_collection(collection);
    let query = collection.query;
    let result_sql = "SELECT * FROM ??";
    if (query) {
        result_sql += ' WHERE ';
        for (let key in query) {
            let val = query[key];
            if (val) {
                result_sql += ' and ?? = ? ';
            }
        }
    }
    result_sql = mysql.format(result_sql, arr);
    if (collection.sort != null ) {
        result_sql += ' ORDER BY ' + collection.sort
    }
    if (collection.limit != null) {
        result_sql += ' LIMIT ' + collection.limit;
    }
    debug('operate of select sql : %s', result_sql);
    pool.query(result_sql, callback);
};

exports.insert = function (collection, callback) {
    collection.operate = 'insert';
    let $set = collection.$set;
    let duplicate = collection.duplicate;
    if ($set == null) {
        callback({'error': 'insert必须包含$set.'});
    } else if (!Array.isArray($set)) {
        callback({'error': 'insert属性$set必须为数组.'});
    } else {
        let arr = init_mysql_collection(collection);
        let result_sql = '';
        let a = 'insert into ?? (';
        let b = ') values (';
        for (let i = 0; i < $set.length; i++) {
            let param_pair = $set[i];
            for (let key in param_pair) {
                a += '??,';
                b += '?,';
            }
            a = strings.reEndComma(a, ',');
            b = strings.reEndComma(b, ',');
            if (result_sql) {
                result_sql += '(' + b + '),';
                b = '';
            } else {
                result_sql += a + b + '),';
                b = '';
            }
        }
        if (duplicate) {
            result_sql = strings.reEndComma(result_sql, ',');
            result_sql += ' on duplicate key update ';
            for (var i = 0; i < duplicate.length; i ++) {
                result_sql += duplicate[i] + '=values(' + duplicate[i] + '),';
            }
        }
        result_sql = strings.reEndComma(result_sql, ',');
        result_sql = mysql.format(result_sql, arr);
        debug('operate of insert sql : %s', result_sql);
        pool.query(result_sql, callback);
    }
};
exports.insert_one = function (collection, callback) {
    collection.operate = 'insert_one';
    let $set = collection.$set;
    if ($set == null) {
        callback({'error': 'insert_one必须包含$set.'});
    } else if (Array.isArray($set)) {
        callback({'error': 'insert_one属性$set不可以为数组.'});
    } else {
        let arr = init_mysql_collection(collection);
        let result_sql = '';
        let a = 'insert into ?? (';
        let b = ') values (';
        for (let key in $set) {
            a += '??,';
            b += '?,';
        }
        a = strings.reEndComma(a, ',');
        b = strings.reEndComma(b, ',');
        if (result_sql) {
            result_sql += '(' + b + '),';
            b = '';
        } else {
            result_sql += a + b + '),';
            b = '';
        }
        result_sql = strings.reEndComma(result_sql, ',');
        result_sql = mysql.format(result_sql, arr);
        debug('operate of insert sql : %s', result_sql);
        pool.query(result_sql, callback);
    }
};
exports.update = function (collection, callback) {
    collection.operate = 'update';
    let $set = collection.$set;
    if ($set == null) {
        callback({'error': 'update必须包含$set.'});
    } else if (Array.isArray($set)) {
        callback({'error': 'update属性$set不可以为数组.'});
    } else {
        let arr = init_mysql_collection(collection);
        let query = collection.query;
        let result_sql = 'UPDATE ?? set ';
        if ($set) {
            for (let key in $set) {
                let val = $set[key];
                if (val) {
                    result_sql += ' ?? = ? ,';
                }
            }
        }
        result_sql = strings.reEndComma(result_sql, ',');
        if (query) {
            result_sql += ' WHERE ';
            for (let key in query) {
                let val = query[key];
                if (val) {
                    result_sql += ' and ?? = ? ';
                }
            }
        }
        result_sql = mysql.format(result_sql, arr);
        debug('operate of update sql : %s', result_sql);
        pool.query(result_sql, callback);
    }
};
exports.insert_or_update = function (collection, callback) {
    collection.operate = 'insert_or_update';
    let query = collection.query;
    let $set = collection.$set;
    let self = this;
    if ($set == null) {
        callback({'error': 'insert_or_update必须包含$set.'});
    } else if (Array.isArray($set)) {
        callback({'error': 'insert_or_update属性$set不可以为数组.'});
    } else {
        collection.operate = 'select';
        let arr = init_mysql_collection(collection);
        collection.operate = 'insert_or_update';
        let result_sql = "SELECT COUNT(1) COUNT FROM ?? ";
        if (query) {
            result_sql += ' WHERE ';
            for (let key in query) {
                let val = query[key];
                if (val) {
                    result_sql += ' and ?? = ? ';
                }
            }
            result_sql = mysql.format(result_sql, arr);
            debug('operate of select count sql : %s', result_sql);
            pool.query(result_sql, function (err, results, fields) {
                if (err) {
                    callback(err, results, fields);
                } else {
                    let count = results[0].COUNT;
                    if (0 === count) {
                        collection.operate = 'insert_one';
                        self.insert_one(collection, callback);
                    } else {
                        collection.operate = 'update';
                        self.update(collection, callback);
                    }
                    collection.operate = 'insert_or_update';
                }
            });
        } else {
            collection.operate = 'insert';
            this.insert(collection, callback);
        }

    }
};
function init_mysql_collection(collection) {
    let operate = collection.operate;
    let $set = collection.$set;
    let result_sql = '';
    if (operate && 'insert' === operate) {
        for (let i = 0; i < $set.length; i++) {
            let keys = '';
            let values = '';
            let param_pair = $set[i];
            for (let key in param_pair) {
                let val = param_pair[key];
                keys = keys + key + separator;
                values = values + val + separator;
            }
            if (result_sql) {
                result_sql += values;
            } else {
                result_sql += collection.name + separator + keys + values;
            }
        }
        result_sql = strings.reEndComma(result_sql, separator);
        debug('init_mysql_collection insert result: %s', result_sql);
        return result_sql.split(separator);
    } else if (operate && 'select' === operate) {
        let result_sql = collection.name + separator;
        let query = collection.query;
        if (query) {
            for (let key in query) {
                let val = query[key];
                if (val) {
                    result_sql += key + separator + query[key] + separator;
                }
            }
        }
        result_sql = strings.reEndComma(result_sql, separator);
        debug('init_mysql_collection select result: %s', result_sql);
        return result_sql.split(separator);
    } else if (operate && 'update' === operate) {
        let query = collection.query;
        let $set = collection.$set;
        let result_sql = collection.name + separator;
        if ($set) {
            for (let key in $set) {
                let val = $set[key];
                if (val) {
                    result_sql += key + separator + val + separator;
                }
            }
        }
        if (query) {
            for (let key in query) {
                let val = query[key];
                if (val !== undefined) {
                    result_sql += key + separator + val + separator;
                }
            }
        }
        result_sql = strings.reEndComma(result_sql, separator);
        debug('init_mysql_collection update result: %s', result_sql);
        return result_sql.split(separator);
    } else if (operate && 'insert_one' === operate) {
        let keys = '';
        let values = '';
        for (let key in $set) {
            let val = $set[key];
            keys = keys + key + separator;
            values = values + val + separator;
        }
        if (result_sql) {
            result_sql += values;
        } else {
            result_sql += collection.name + separator + keys + values;
        }
        result_sql = strings.reEndComma(result_sql, separator);
        debug('init_mysql_collection insert_one result: %s', result_sql);
        return result_sql.split(separator);
    }
}
