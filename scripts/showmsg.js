var then = require("thenjs");
var readline = require('readline');
var _ = require("underscore");
var moment = require("moment");
var util = require("util");
var fs = require("fs");

console.log("加载数据存储模块...");

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

		libqq.downloadGroupImage(msg);

		msg.group = group;

		var uuid = require('node-uuid');
		fs.writeFile('data/msg/'+ uuid.v1() , JSON.stringify(msg), function (err) {
  			if (err) throw err;
		});
	});
}
