var then = require("thenjs");
var readline = require('readline');
var _ = require("underscore");
var moment = require("moment");
var util = require("util");

// var MongoClient = require('mongodb').MongoClient,

var MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	format = require('util').format;
var mongoClient = new MongoClient(new Server('localhost', 27017));

function save(msg) {
	mongoClient.open(function(err, mongoClient) {
		var db1 = mongoClient.db("test");

		var collection = db1.collection('message');
		collection.insert(msg, function(err, docs) {
			mongoClient.close();
		});
	});
}

module.exports = function(libqq) {

	libqq.on('sessmessage', function(msg) {
		var account = libqq.getAccount();

		var qq = account.idmap[msg.from.uin] || "";
		msg.from.qq = qq;

		var buddy = account.buddies[+msg.from.uin] || {};
		var name = msg.from.uin + "(" + buddy.nick + "/" + qq + ")";
		var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
		var content = util.format("%s 收到 %s 发来的消息：\r\n %s", time, name, msg.text);
		console.log(content);
		save(msg);
	});

	libqq.on('message', function(msg) {
		var account = libqq.getAccount();

		var qq = account.idmap[msg.from.uin] || "";
		msg.from.qq = qq;
		var buddy = account.buddies[+msg.from.uin] || {};
		var name = msg.from.uin + "(" + buddy.nick + "/" + qq + ")";
		var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
		var content = util.format("%s 收到 %s 发来的消息：\r\n %s", time, name, msg.text);
		console.log(content);
		save(msg);
	});

	libqq.on('groupmessage', function(msg) {
		var account = libqq.getAccount();
		var qq = account.idmap[msg.from.uin] || "";
		msg.from.qq = qq;
		var username = msg.from.uin + "(" + msg.from.nick + "/" + (msg.from.markname || "") + "/" + qq + ")";

		var group = account.qun[msg.from_uin];
		var groupname = msg.from_uin + "(" + group.name + ")";

		var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
		var content = util.format("%s 收到 %s 发来的群[%s]消息：\r\n %s", time, username, groupname, msg.text);
		console.log(content);

		save(msg);
	});
}