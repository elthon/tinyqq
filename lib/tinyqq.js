var then = require("thenjs");
var readline = require('readline');
var _ = require("underscore");
var moment = require("moment");
var util = require("util");


var readline = require('readline'),
	rl = readline.createInterface(process.stdin, process.stdout);

var QQClient = require("libqq").QQClient;
var libqq = null;

var msgId = 5000;

var currentStatus = {
	status: -1,
	toUin: {
		uin: 1
	}
}; //保存当前的一些状态信息，比如命令，参数值等


console.log("欢迎使用TinyQQ，请先登录后再使用。输入 help 参考命令帮助。");
rl.prompt();
resetCli();

rl.on('line', function(input) {

	input = input.trim();

	if (isEmptyInput(input)) {
		return;
	}

	var argv = require('minimist')(input.split(" "));
	//得到解析后的数据
	var command = argv._[0]; //命令

	switch (command) {
		case 'print':
			if (libqq && libqq.getAccount()) {
				printDebugInfo(argv);
			}
			break;
		case 'login':
			login(argv.u, argv.p);
			break;
		case 'exit':
			process.exit(0);
			break;
		case 'send':
			//进入send状态
			{
				var uin = argv.u;
				var input = _.last(argv._, argv._.length - 1).join(" ");
				sendMsg(uin, input);
				break;
			}
		case 'list':
			listUser();
			break;
		case 'help':
			{
				showHelp();
				break;
			}
		default:
			{
				showHelp(command);
				break;
			}
	}

	if (command !== 'send') {
		rl.prompt();
	}
}).on('close', function() {
	console.log("hello");
}).on('SIGINT', function() {
	rl.question('Are you sure you want to exit? ', function(answer) {
		if (answer.match(/^y(es)?$/i)) {
			rl.pause();
		} else {
			rl.prompt();
		}
	});
});

process.on('exit', function() {
	console.log("退出");
	if (libqq && libqq.getAccount().status === 1) {
		libqq.logout();
	}
})

function login(u, p) {
	if (!u || !p) {
		showHelp();
		return;
	}

	libqq = new QQClient({
		uin: u,
		password: p,
		clientid: Math.round(Math.random() * 100000000)
	});

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
			rl.question('Please input your verify code : ', function(answer) {
				defer(null, answer);

			});
		}
	}).then(function(defer, vc) {
		rl.prompt();
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
		rl.prompt();

		libqq.pollMsg();

		defer(null, 1)

	}).then(function(defer, gitAccount) {

		libqq.on('message', function(msg) {
			var account = libqq.getAccount();

			var buddy = account.buddies[+msg.from.uin] || {};
			var name = msg.from.uin + "(" + buddy.nick + ")";
			var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
			var content = util.format("%s 收到 %s 发来的消息：\r\n %s", time, name, msg.text);
			console.log(content);
			rl.prompt();
		});

		libqq.on('groupmessage', function(msg) {
			var account = libqq.getAccount();

			var buddy = account.buddies[+msg.from.uin] || {};
			var username = msg.from.uin + "(" + buddy.nick + ")";

			var group = account.qun[msg.from_uin];
			var groupname = msg.from_uin + "(" + group.name + ")";

			var time = moment(msg.time).format("YYYY-MM-DD HH:mm:ss");
			var content = util.format("%s 收到 %s 发来的群[%s]消息：\r\n %s", time, username, groupname, msg.text);
			console.log(content);
			rl.prompt();
		});

		libqq.on("kick", function(msg) {
			console.log(msg);
			process.exit(0);
		})

		then.parallel([libqq.fetchMyInfo, libqq.fetchMyBuddies, _.partial(libqq.fetchMyGroupList, true)], libqq).
		then(function(d, value) {
			defer(null, 1);
		}, function(d, error) {
			console.log(JSON.stringify(error));
		});

	}).then(function(defer) {
		rl.setPrompt('TinyQQ[' + u + ']> ');
		currentStatus.status = 1; //登录
		currentStatus.uin = u;
		rl.prompt();
	}).fail(function(defer, error) {
		console.log(error);
	});
}

function resetCli() {
	if (currentStatus.status == 1) {
		rl.setPrompt('TinyQQ[' + currentStatus.uin + ']> ');
	} else {
		rl.setPrompt('TinyQQ> ');
	}
	rl.prompt();
}

function isEmptyInput(input) {
	if (!input || input.trim().length === 0) {
		resetCli();
		return true;
	}
	return false;
}

function showHelp(command) {
	var list = [];
	if (command) {
		list.push("你输入的命令[" + command + "]不支持。\r\n");
	}
	list.push("目前支持的命令：\r\n");
	list.push("print                --- 打印调试信息\r\n");
	list.push("login -u xxx -p xxx  --- 列出当前用户的好友列表\r\n");
	list.push("list                 --- 列出当前用户的好友列表\r\n");
	list.push("session              --- 进入和uin的会话状态\r\n");
	list.push("exit                 --- 退出TinyQQ\r\n");
	list.push("help                 --- 显示此帮助");

	console.log(list.join(""));
}


function printDebugInfo(args) {
	var account = libqq.getAccount();
	//打印用户
	if (args.u) {
		if (args.i) {
			var i = args.i;
			console.log("好友[" + account.buddies[i].nick + "]信息：\r\n", account.buddies[i]);
		} else {
			console.log("好友列表：\r\n", account.buddies);
		}
		return;
	}

	if (args.g) {
		if (args.i) {
			var i = args.i;
			var qun = account.qun[i];
			if (args.m) {
				var m = args.m;
				console.log("群[" + qun.name + "]成员[" + m + "]信息：\r\n", qun.members[m]);
			} else {
				console.log("群[" + qun.name + "]信息：\r\n", qun);
			}
		} else {
			console.log("群列表：\r\n", account.qun);
		}

		return;
	}

	console.log(account);
	return;
}

function sendMsg(uin, input) {

	//发送消息
	then(function(defer) {
		var msg = {};

		msg.to_uin = +uin,
		msg.text = input;
		msg.id = msgId + 1;

		libqq.sendMsg(msg, defer);
	}).then(function(defer) {
		console.log("消息发送成功.");
		rl.prompt();
	});

}

function listUser() {

	//从用户缓存读取信息
	var myInfo = libqq.getAccount().detail;
	var buddies = libqq.getAccount().buddies;
	var bc = _.keys(buddies).length;

	console.log("欢迎您[" + myInfo.nick + "]，您有好友：" + bc + "个。");

	_.each(buddies, function(buddy) {
		var mn = buddy.markname ? "(" + buddy.markname + ")" : "";
		console.log(buddy.uin + " " + buddy.categories.name + "/" + buddy.nick + mn);
	});

}