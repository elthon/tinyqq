var then = require("thenjs");
var readline = require('readline');
var _ = require("underscore");
var moment = require("moment");
var util = require("util");

var request = require("request");
var net = require("net");

var readline = require('readline');
var QQClient = require("libqq").QQClient;

var commandHandler = require("./command");

function TinyQQ() {

	var auth = require("./auth");

	//初始化网络服务
	this.libqq = new QQClient({
		uin: auth.uin,
		password: auth.password,
		clientid: Math.round(Math.random() * 100000000),
		idmap:{}
	});

	this.verifyCode = null; //等待用户输入的验证码

	this.streamServer = net.createServer(_.bind(this.handleSocket, this));
	this.streamServer.maxConnections = 1;
	this.streamServer.listen(7001);

	this.login();
}

TinyQQ.prototype.handleSocket = function(socket) {

	//数据错误事件
	socket.on('error', function(exception) {
		console.log('socket error:' + exception);
		socket.end();
	});

	//客户端关闭事件
	socket.on('close', function(data) {
		console.log('close: ' +
			socket.remoteAddress + ' ' + socket.remotePort);
	});

	var self = this;
	var libqq = self.libqq;

	var rl = readline.createInterface(socket, socket); //创建socket链接
	rl.setPrompt("TinyQQ>")
	rl.prompt();
	socket.write("欢迎登录TinyQQ控制台，当前机器人为[" + libqq.getAccount().uin + "]，输入 help 获取帮助。\n");
	rl.prompt();

	//接收命令进行处理
	rl.on('line', _.bind(commandHandler, this, socket, rl));
}

function loadCookieJar() {

	var cookies = require('tough-cookie'); // note: not 'cookie', 'cookies' or 'node-cookie'
	var Cookie = cookies.Cookie;
	var cookie = Cookie.fromJSON()

	var cookiejar = new cookies.CookieJar();
}

TinyQQ.prototype.login = function() {

	var libqq = this.libqq;
	var self = this;

	var fs = require("fs");

	if (fs.existsSync("data/account.json")) {
		var accountJSON = fs.readFileSync("data/account.json");
		var account = JSON.parse(accountJSON);

		var cookieJar = null;
	}

	then(function(defer) {
		libqq.loginCheck(defer);
	}).then(function(defer, value) {
		if (value.needVerify) {
			libqq.fetchCaptchaImage(defer);
		} else {
			//获取得到的vc
			libqq.setVerifyCode(value.salt);

			defer(null, 1);
		}
	}).then(function(defer, value) {
		if (value === 1) {
			defer(null, 1);
		} else {
			console.log("需要输入验证码，请登录控制台输入验证码。");

			var checkCode = function() {
				if (self.verifyCode) {
					defer(null, self.verifyCode);
					return;
				} else {
					setTimeout(checkCode, 100);
				}
			}
			checkCode();
		}
	}).then(function(defer, vc) {
		if (vc === 1) {
			defer(null, 1);
		} else {
			//获取得到的vc
			libqq.setVerifyCode(vc);

			//开始执行登录过程了。
			defer(null, vc);
		}
	}).then(function(defer, vc) {
		libqq.login(defer);
	}).then(function(defer, value) {
		//用户成功登录系统了
		console.log("开始接受好友以及群消息。。。");
		libqq.pollMsg();
		defer(null, 1)
	}).then(function(defer, gitAccount) {


		then.parallel([libqq.fetchMyInfo, libqq.fetchMyBuddies, _.partial(libqq.fetchMyGroupList, true)], libqq).
		then(function(d, value) {

			//读取所有的scripts并执行
			var loadFile = function(path, file) {
				console.log("加载", file);
				var Path = require("path");
				var ext = Path.extname(file)
				var full = Path.join(path, Path.basename(file, ext));
				require("../" + full)(libqq);
			}

			var load = function(path) {
				var fs = require('fs');
				fs.exists(path, function(exists) {
					if (exists) {
						_.each(fs.readdirSync(path), function(file) {
							loadFile(path, file)
						})
					}
				});
			}

			load("scripts");

		}, function(d, error) {
			console.log(JSON.stringify(error));
		});

		libqq.on("kick", function(msg) {
			console.log(msg);
			process.exit(0);
		})
	}).then(function(defer) {
		
	}).fail(function(defer, error) {
		console.log(error, error.stack);
	});
}


var tinyQQ = new TinyQQ();
module.exports = tinyQQ;