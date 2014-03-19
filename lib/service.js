var express = require("express");
var app = express();
var path = require("path");

function HttpService(tinyQQ) {
	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.static(path.join(__dirname, '../data')));
	app.use(express.static(path.join(__dirname, '../static')));

	app.post('/logout', function(req, res) {
		tinyQQ.getClient().logout();
	});

	app.post('/verify', function(req, res) {
		var verifyCode = req.body.verify;
		if (verifyCode && verifyCode.length == 4) {
			tinyQQ.verifyCode = verifyCode;
			res.send(200, '成功输入验证码！<a href="/index.html">返回</a>');
		} else {
			res.send(200, '验证码输入错误！<a href="/index.html">返回</a>');
		}
	});

	app.get('/listUsers.json', function(req, res) {
		res.status(200);
		res.set('Content-Type', 'application/json;charset=UTF-8');
		res.send(tinyQQ.getClient().getAccount());
	})
	app.listen(3000);
}

module.exports = HttpService;
