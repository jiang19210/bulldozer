"use strict";
var express = require('express');
var router = express.Router();
var Worker = require('../proxy/worker');
var worker = new Worker();
/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'schedule-server'});
});
router.post('/worker/:event', function (req, res) {
    var event = req.params.event;
    var collection = req.body;
    worker.emit(event, req, res, collection);
});
router.get('/health', function (req, res) {
    res.send({});
});
module.exports = router;