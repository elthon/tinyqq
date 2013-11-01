//处理接收到的命令

function isEmptyInput(input) {
	if (!input || input.trim().length === 0) {
		return true;
	}
	return false;
}

function showHelp(command, socket) {
	var list = [];
	if (command) {
		list.push("你输入的命令[" + command + "]不支持。\r\n");
	}
	list.push("目前支持的命令：\r\n");
	list.push("print                --- 打印调试信息\r\n");
	list.push("list                 --- 列出当前用户的好友列表\r\n");
	list.push("exit                 --- 退出TinyQQ\r\n");
	list.push("deploy -f            --- 部署自动脚本\r\n")
	list.push("help                 --- 显示此帮助\r\r");

	socket.write(list.join(""));
}

function printDebugInfo(args, socket, libqq) {
	var account = libqq.getAccount();
	//打印用户
	if (args.u) {
		if (args.i) {
			var i = args.i;
			socket.write("好友[" + account.buddies[i].nick + "]信息：\r\n" +  JSON.stringify(account.buddies[i]));
		} else {
			socket.write("好友列表：\r\n" +  JSON.stringify(account.buddies));
		}
		return;
	}

	if (args.g) {
		if (args.i) {
			var i = args.i;
			var qun = account.qun[i];
			if (args.m) {
				var m = args.m;
				socket.write("群[" + qun.name + "]成员[" + m + "]信息：\r\n" +  JSON.stringify(qun.members[m]));
			} else {
				socket.write("群[" + qun.name + "]信息：\r\n" +  JSON.stringify(qun));
			}
		} else {
			socket.write("群列表：\r\n" + JSON.stringify(account.qun));
		}

		return;
	}

	socket.write(JSON.stringify(account));
	return;
}

//接收外部的输入，并进行响应

module.exports = function(socket, rl, input) {

	var self = this;
	var libqq = this.libqq;

	input = input.trim();

	if (isEmptyInput(input)) {
		rl.prompt();
		return;
	}

	var argv = require('minimist')(input.split(" "));
	//得到解析后的数据
	var command = argv._[0]; //命令

	var prompt = true;

	switch (command) {
		case 'help':
			{
				showHelp(null, socket);
				break;
			}
		case 'print':
			if (libqq && libqq.getAccount()) {
				printDebugInfo(argv, socket, libqq);
			}
			break;
		case 'vc':
			self.verifyCode = argv.u;
			break;
		case "exit":
			socket.destroy();
			break;
		default:
			{
				showHelp(command, socket);
				break;
			}
	}

	if (prompt) {
		rl.prompt();
	}
}