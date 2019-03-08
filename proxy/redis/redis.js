"use strict";
const client = require("./redis_connect").redis();
exports.lpushs = function (key, arr, f) {
    if (Array.isArray(arr) && arr.length === 1) {
        arr = arr[0];
    }
    if (typeof key === 'string' && Array.isArray(arr)) {
        let arg0 = [];
        arg0.push(key);
        for (let i = 0; i < arr.length; i++) {
            let val = arr[i];
            if (typeof val === 'object') {
                val = JSON.stringify(val);
            }
            arg0.push(val);
        }
        client.lpush(arg0, function (err, result) {
            f(err, result);
        });
    } else {
        if (typeof arr === 'object') {
            arr = JSON.stringify(arr);
        }
        client.lpush(key, arr, function (err, result) {
            f(err, result);
        });
    }
};
exports.multilpush = function (key, arr, f) {
    let multi = client.multi();
    for (let i = 0; i < arr.length; i++) {
        let val = arr[i];
        if (typeof val == 'object') {
            val = JSON.stringify(val);
        }
        multi.lpush(key, val);
    }
    multi.exec(function (err, result) {
        f(err, result);
    });
};
exports.rpoplpush = function (source, destination, f) {
    let key = [source, destination];
    client.rpoplpush(key, f);
};
//1.判断value是否存在keyBak中
//2.如果存在返回0
//3.如果不存在就sadd到key中，并返回1
//4.只支持每次一条数据操作
exports.saddOrBak = function (key, value, f) {
    let script = "local keyBak = KEYS[1]..':Bak' local member = ARGV[1]   local bak = redis.call('SISMEMBER', keyBak, member) if bak == 0 then redis.call('SADD', KEYS[1], member) return 1 else return 0 end";
    let args = [script, 1, key, value];
    client.eval(args, function (err, result) {
        f(err, result);
    });
};
//1.判断value是否存在keyBak中
//2.如果存在返回0
//3.如果不存在就sadd到key中，并返回1
//4.支持批量操作，arr是数组
exports.multisaddOrBak = function (key, arr, f) {
    let script = "local keyBak = KEYS[1]..':Bak' local member = ARGV[1]   local bak = redis.call('SISMEMBER', keyBak, member) if bak == 0 then redis.call('SADD', KEYS[1], member) return 1 else return 0 end";
    let multi = client.multi();
    for (let i = 0; i < arr.length; i++) {
        let val = arr[i];
        if (typeof val == 'object') {
            val = JSON.stringify(val);
        }
        let args = [script, 1, key, val];
        multi.eval(args);
    }
    multi.exec(function (err, result) {
        f(err, result);
    });
};
exports.sadds = function (key, arr, f) {
    if (Array.isArray(arr) && arr.length === 1) {
        arr = arr[0];
    }
    if (typeof key === 'string' && Array.isArray(arr)) {
        let arg0 = [];
        arg0.push(key);
        for (let i = 0; i < arr.length; i++) {
            let val = arr[i];
            if (typeof val === 'object') {
                val = JSON.stringify(val);
            }
            arg0.push(val);
        }
        client.sadd(arg0, function (err, result) {
            f(err, result);
        });
    } else {
        if (typeof arr === 'object') {
            arr = JSON.stringify(arr);
        }
        client.sadd(key, arr, function (err, result) {
            f(err, result);
        });
    }
};
exports.multisadd = function (key, arr, f) {
    let multi = client.multi();
    for (let i = 0; i < arr.length; i++) {
        let val = arr[i];
        if (typeof val == 'object') {
            val = JSON.stringify(val);
        }
        multi.sadd(key, val);
    }
    multi.exec(function (err, result) {
        f(err, result);
    });
};
exports.saddDistinct = function (key, value, f) {
    let keyBak = key + ':distinct';
    let md5 = null;
    if (typeof value === 'object') {
        md5 = value.md5;
        value = JSON.stringify(value);
    }
    if (md5 == null) {
        md5 = value;
    }
    client.sadd(keyBak, md5, function (err, result) {
        if (1 === result) {
            client.sadd(key, value, function () {
                f(err, result);
            });
        } else {
            f(err, result);
        }
    });
};
exports.saddDistincts = function (key, arr, f) {
    if (Array.isArray(arr) && arr.length === 1) {
        arr = arr[0];
    }
    if (typeof key === 'string' && Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
            this.saddDistinct(key, arr[i], function (err, result) {
                if (err) {
                    console.error('saddDistincts 发生异常. s%', err);
                }
            });
        }
        f('', arr.length);
    } else {
        this.saddDistinct(key, arr, function (err, result) {
            f(err, result);
        });
    }
};
exports.spopsadd = function (key, f) {
    client.spop(key, function (err, result) {
        f(err, result);
        if (result != null) {
            client.sadd([key + ':Bak', result]);
        }
    });
};
exports.renamenx = function (key, newkey, f) {
    let _key = [key, newkey];
    client.renamenx(_key, f);
};
exports.delOrBak = function (key, f) {
    let _key = [key, key + ':Bak'];
    if (f) {
        client.del(_key, f);
    } else {
        client.del(_key);
    }
};
exports.del = function (key, f) {
    if (f) {
        client.del(key, f);
    } else {
        client.del(key);
    }
};
exports.rpop = function (key, f) {
    client.rpop(key, f);
};
exports.lpop = function (key, f) {
    client.lpop(key, f);
};
exports.spop = function (key, f) {
    client.spop(key, f);
};
exports.set = function (key, value, f) {
    client.set(key, value, f);
};
exports.get = function (key, f) {
    client.get(key, f);
};
exports.exists = function (key, f) {
    client.exists(key, f);
};
exports.incr = function (key, f) {
    client.incr(key, f);
};