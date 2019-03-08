"use strict";
var mongodbConnect = require('./mongodb_connect');
var client = mongodbConnect.mongodb(function (cli) {
	client = cli;
});
//保存
exports.save = function (collection, data, callback) {
	if (collection == null || data == null || data.length == 0) {
		callback(null, 'collection or data is null.');
	} else {
		client.collection(collection, function(err, collection) {
			collection.insert(data, callback);
		});
	}
};
//查询
exports.find = function (collection, search, sort, callback) {
	client.collection(collection, function(err, collection) {
		collection.find(search).sort(sort).toArray(callback);
	});
};
//查询
exports.findField = function (collection, search, field, sort, callback) {
	client.collection(collection, function(err, collection) {
		collection.find(search, field).sort(sort).toArray(callback);
	});
};
//更新
exports.update = function (collection, query, update, options, callback) {
	client.collection(collection, function(err, collection){
		collection.update(query, update, options, callback);
	});
};
exports.remove = function (collection, query, callback) {
	client.collection(collection, function(err, collection){
		collection.remove(query, callback);
	});
};
exports.saveOrUpdateAll = function (collection, data, callback) {
	if (collection == null || data == null || data.length == 0) {
		callback(null, 'collection or data is null.');
	} else {
		client.collection(collection, function(err, collection) {
			for (var i = 0; i < data.length; i ++) {
				collection.update(data[i].query, data[i].update, {upsert : true}, callback);
			}
		});
	}
	
};
exports.saveOrUpdate = function (collection, query, update, callback) {
	client.collection(collection, function(err, collection){
		collection.update(query, update, {upsert : true}, callback);
	});
};
//查询更新
exports.findAndModify = function (collection, query, sort, update, options, callback) {
	client.collection(collection, function(err, collection) {
		//--- start
		collection.findAndModify(query, sort, update, options, callback);
		//-- end
	});
};
exports.findAndModify = function (collection, query, sort, update, callback) {
	client.collection(collection, function(err, collection) {
		//--- start
		collection.findAndModify(query, sort, update, {upsert : false}, callback);
		//-- end
	});
};
//查询删除
exports.findAndRemove = function (collection, query, sort, update, options, callback) {
	client.collection(collection, function(err, collection) {
		//--- start
		collection.findAndModify(query, sort, update, options, callback);
		//-- end
	});
};
//删除collection db.tuniu_urls.drop()
exports.dropCollection = function (collection, callback) {
	client.dropCollection(collection, callback); 
};
//重命名collection
exports.renameCollection = function (collection0, collection1, callback) {
	client.renameCollection(collection0, collection1, callback); 
};

