var then = require("thenjs");
var readline = require('readline');
var _ = require("underscore");
var moment = require("moment");
var util = require("util");

var MongoClient = require('mongodb').MongoClient,
	format = require('util').format;

function save(msg) {
	MongoClient.connect('mongodb://192.168.60.192:27017/test', function(err, db) {
		if (err) throw err;

		var collection = db.collection('message');
		collection.insert(msg, function(err, docs) {

		});
	})
}

module.exports = function(libqq) {

	libqq.on('sessmessage', function(msg) {
		var account = libqq.getAccount();

		var buddy = account.buddies[+msg.from.uin] || {};
		var name = msg.from.uin + "(" + buddy.nick + ")";
		var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
		var content = util.format("%s 收到 %s 发来的消息：\r\n %s", time, name, msg.text);
		console.log(content);
		save(msg);
	});

	libqq.on('message', function(msg) {
		var account = libqq.getAccount();

		var buddy = account.buddies[+msg.from.uin] || {};
		var name = msg.from.uin + "(" + buddy.nick + ")";
		var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
		var content = util.format("%s 收到 %s 发来的消息：\r\n %s", time, name, msg.text);
		console.log(content);
		save(msg);
	});

	libqq.on('groupmessage', function(msg) {
		var account = libqq.getAccount();

		var username = msg.from.uin + "(" + msg.from.nick + "/" + (msg.from.markname || "") + ")";

		var group = account.qun[msg.from_uin];
		var groupname = msg.from_uin + "(" + group.name + ")";

		var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
		var content = util.format("%s 收到 %s 发来的群[%s]消息：\r\n %s", time, username, groupname, msg.text);
		console.log(content);

		save(msg);
	});
}