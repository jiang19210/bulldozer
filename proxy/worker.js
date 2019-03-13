"use strict";
const mongodb = require('./mongodb/mongodb');
const redis = require('./redis/redis');
const mysql = require('./mysql/mysql');
const events = require('events');
const util = require('util');
const node_uuid = require('node-uuid');

function Worker() {
    events.EventEmitter.call(this);
    var prototypes = this.funs;
    for (var i = 0; i < prototypes.length; i++) {
        this.on(prototypes[i], this[prototypes[i]]);
    }
}

util.inherits(Worker, events.EventEmitter);
Worker.prototype.find = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    var sort = collection.sort;
    if (sort == null) {
        sort = {};
    }
    mongodb.find(name, data, sort, function (err, result) {
        if (err) {
            var uuid = node_uuid.v4();
            console.error('[find] - 查询数据异常.uuid : [%s], error_message : [%s]', uuid, JSON.stringify(err));
            res.send({'result': '[find] - 查询数据异常.', 'is_success': false, 'uuid': uuid});
        } else {
            res.send({'result': result, 'is_success': true});
        }
    });
};
Worker.prototype.findField = function (req, res, collection) {
    var name = collection.name;
    var search = collection.data;
    var field = collection.field;
    var sort = collection.sort;
    if (sort == null) {
        sort = {};
    }
    mongodb.findField(name, search, field, sort, function (err, result) {
        if (err) {
            var uuid = node_uuid.v4();
            console.error('[findField] - 查询数据异常.uuid : [%s], error_message : [%s]', uuid, JSON.stringify(err));
            res.send({'result': '[findField] - 查询数据异常.', 'is_success': false, 'uuid': uuid});
        } else {
            res.send({'result': result, 'is_success': true});
        }
    });
};
Worker.prototype.findAndModify = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    mongodb.findAndModify(name, data.query, data.sort, data.update, function (err, result) {
        if (err) {
            var uuid = node_uuid.v4();
            console.error('[findAndModify] - 查询数据异常. uuid : [%s], error_message : ', uuid, JSON.stringify(err));
            res.send({'result': '[findAndModify] - 查询数据异常.', 'is_success': false, 'uuid': uuid});
        } else {
            res.send({'result': result, 'is_success': true});
        }
    });
};
Worker.prototype.save = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[save] - 数据为空.');
        res.send({'result': '[save] - 数据为空,保存失败.', 'is_success': false});
    } else {
        mongodb.save(name, data, function (err, result) {
            if (err) {
                var uuid = node_uuid.v4();
                console.error('[save] - 保存数据异常. uuid : [%s], error_message : [%s]', uuid, JSON.stringify(err));
                res.send({'result': '[save] - 保存数据异常.', 'is_success': false, 'uuid': uuid});
            } else {
                res.send({'is_success': true});
            }
        });
    }
};

Worker.prototype.saveOrUpdate = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[saveOrUpdate] - 数据为空.');
        res.send({'result': '[saveOrUpdate] - 数据为空,保存失败.', 'is_success': false});
    } else {
        mongodb.saveOrUpdate(name, data.query, data.update, function (err, result) {
            if (err) {
                var uuid = node_uuid.v4();
                console.error('[saveOrUpdate] - 保存数据异常. uuid : [%s]; error_messsage : [%s]', uuid, JSON.stringify(err));
                res.send({'result': '[saveOrUpdate] - 保存数据异常.', 'is_success': false, 'uuid': uuid});
            } else {
                res.send({'is_success': true});
            }
        });
    }
};
Worker.prototype.saveOrUpdateAll = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[saveOrUpdateAll] - 数据为空.');
        res.send({'result': '[saveOrUpdateAll] - 数据为空,保存失败.', 'is_success': false});
    } else {
        try {
            mongodb.saveOrUpdateAll(name, data, function (err, result) {
                if (err) {
                    throw (err);
                }
            });
            res.send({'is_success': true});
        } catch (err) {
            var uuid = node_uuid.v4();
            console.error('[saveOrUpdateAll] - 保存数据异常. uuid : [%s], error_message : [%s]', uuid, JSON.stringify(err));
            res.send({'result': '[saveOrUpdateAll] - 保存数据异常.', 'is_success': false, 'uuid': uuid});
        }
    }
};

Worker.prototype.dropCollection = function (req, res, collection) {
    var name = collection.name;
    if (name == null || name.length == 0) {
        console.log('[save] - 集合名字为空.');
        res.send({'result': '[dropCollection] - 集合名称为空,删除失败.', 'is_success': false});
    } else {
        mongodb.dropCollection(name, function (err, result) {
            if (err) {
                var uuid = node_uuid.v4();
                console.error('[dropCollection] - 删除异常. uuid : [%s], error_message : [%s]', uuid, JSON.stringify(err));
                res.send({'result': '[save] - 删除异常.', 'is_success': false, 'uuid': uuid});
            } else {
                res.send({'is_success': true});
            }
        });
    }
};

//redis
function handlerResponse(res, err, result, m) {
    if (err) {
        var taskid = node_uuid.v4();
        console.error('[%s]-[%s]-异常. error_message:[%s]', m, taskid, JSON.stringify(err));
        res.send({'result': err, 'is_success': false, 'taskid': taskid});
    } else {
        res.send({'result': result, 'is_success': true});
    }
}

Worker.prototype.lpushs = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[lpushs] - 数据为空. ');
        res.send({'result': '[lpushs] - 数据为空,加入队列失败.', 'is_success': false});
    } else {
        redis.lpushs(name, data, function (err, result) {
            handlerResponse(res, err, result, 'redis.lpushs');
        });
    }
};
Worker.prototype.multilpush = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[multilpush] - 数据为空. ');
        res.send({'result': '[multilpush] - 数据为空,加入队列失败.', 'is_success': false});
    } else {
        redis.multilpush(name, data, function (err, result) {
            handlerResponse(res, err, result, 'redis.multilpush');
        });
    }
};
Worker.prototype.sadds = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[sadds] - 数据为空. ');
        res.send({'result': '[sadds] - 数据为空,加入队列失败.', 'is_success': false});
    } else {
        redis.sadds(name, data, function (err, result) {
            handlerResponse(res, err, result, 'redis.sadds');
        });
    }
};
Worker.prototype.multisadd = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[multisadd] - 数据为空. ');
        res.send({'result': '[multisadd] - 数据为空,加入队列失败.', 'is_success': false});
    } else {
        redis.multisadd(name, data, function (err, result) {
            handlerResponse(res, err, result, 'redis.multisadd');
        });
    }
};
Worker.prototype.saddDistinct = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[saddDistinct] - 数据为空. ');
        res.send({'result': '[saddDistinct] - 数据为空,加入队列失败.', 'is_success': false});
    } else {
        redis.saddDistinct(name, data, function (err, result) {
            handlerResponse(res, err, result, 'redis.saddDistinct');
        });
    }
};
Worker.prototype.saddDistincts = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    if (data == null || data.length == 0) {
        console.log('[saddDistincts] - 数据为空. ');
        res.send({'result': '[saddDistincts] - 数据为空,加入队列失败.', 'is_success': false});
    } else {
        redis.saddDistincts(name, data, function (err, result) {
            handlerResponse(res, err, result, 'redis.saddDistincts');
        });
    }
};
Worker.prototype.spop = function (req, res, collection) {
    var name = collection.name;
    redis.spop(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.spop');
    });
};
Worker.prototype.rpop = function (req, res, collection) {
    var name = collection.name;
    redis.rpop(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.rpop');
    });
};
Worker.prototype.lpop = function (req, res, collection) {
    var name = collection.name;
    redis.lpop(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.lpop');
    });
};
Worker.prototype.delOrBak = function (req, res, collection) {
    var name = collection.name;
    redis.delOrBak(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.delOrBak');
    });
};
Worker.prototype.del = function (req, res, collection) {
    var name = collection.name;
    redis.del(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.del');
    });
};
Worker.prototype.multisaddOrBak = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    redis.multisaddOrBak(name, data, function (err, result) {
        handlerResponse(res, err, result, 'redis.multisaddOrBak');
    });
};
Worker.prototype.spopsadd = function (req, res, collection) {
    var name = collection.name;
    redis.spopsadd(name, function (err, result) {
        handlerResponse(res, err, result, 'redis.spopsadd');
    });
};

Worker.prototype.rpoplpush = function (req, res, collection) {
    var name0 = collection.name0;
    var name1 = collection.name1;
    redis.rpoplpush(name0, name1, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.rpoplpush');
    });
};
Worker.prototype.exists = function (req, res, collection) {
    var name = collection.name;
    redis.exists(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.exists');
    });
};
Worker.prototype.incr = function (req, res, collection) {
    var name = collection.name;
    redis.incr(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.exists');
    });
};
Worker.prototype.remove = function (req, res, collection) {
    var name = collection.name;
    var data = collection.data;
    if (typeof data == 'string') {
        data = JSON.parse(data)
    }
    mongodb.remove(name, data, function (err, result) {
        handlerResponse(res, err, result, null, 'mongodb.remove');
    });
};
Worker.prototype.set = function (req, res, collection) {
    var name = collection.name;
    var value = collection.data.value;
    redis.set(name, value, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.set');
    });
};
Worker.prototype.get = function (req, res, collection) {
    var name = collection.name;
    redis.get(name, function (err, result) {
        handlerResponse(res, err, result, null, 'redis.get');
    });
};
//mysql
Worker.prototype.mysql_save = function (req, res, collection) {
    mysql.insert(collection, function (err, results) {
        handlerResponse(res, err, results, null, 'mysql.mysql_save');
    });
};

Worker.prototype.mysql_update = function (req, res, collection) {
    mysql.update(collection, function (err, results) {
        handlerResponse(res, err, results, null, 'mysql.mysql_update');
    });
};

Worker.prototype.mysql_select = function (req, res, collection) {
    mysql.select(collection, function (err, results) {
        handlerResponse(res, err, results, null, 'mysql.mysql_select');
    });
};

Worker.prototype.funs = ['spopsadd', 'multisaddOrBak', 'delOrBak', 'rpop', 'lpushs', 'find', 'findAndModify', 'save', 'saveOrUpdateAll', 'rpoplpush', 'saveOrUpdate', 'dropCollection', 'findField', 'exists', 'incr', 'remove', 'mysql_save', 'mysql_update', 'mysql_select', 'multilpush', 'sadds', 'multisadd', 'spop', 'saddDistinct', 'saddDistincts', 'lpop', 'del', 'get', 'set'];
module.exports = Worker;