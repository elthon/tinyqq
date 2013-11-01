var then = require("thenjs");
var request = require("request");
var _ = require("underscore");

var msgId = 16000;

module.exports = function(libqq) {

	libqq.on("groupmessage", function(msg) {

		try {
			var account = libqq.getAccount();

			var gid = msg.from_uin;
			var group = account.qun[msg.from_uin];

			var text = msg.text.trim();

			if (text.length > 0) {
				var ms = null;
				if (ms = text.match(/^calc (.*)$/i)) {

					then(function(defer) {
						request.get({
							"url": "https://www.google.com/ig/calculator?hl=zh-CN&q=" + encodeURIComponent(ms[1]),
							"headers": {
								'Accept-Language': 'en-us,en;q=0.5',
								'Accept-Charset': 'utf-8',
								'User-Agent': "Mozilla/5.0 (X11; Linux x86_64; rv:2.0.1) Gecko/20100101 Firefox/4.0.1"
							},
							json: true
						}, function(error, res, body) {
							if (error) {
								defer(error);
							} else {
								var json = eval("("+body+")")
								defer(null, (json.rhs.length>0) ? json.rhs : "算不出来");
							}
						})

					}).then(function(defer, result) {

						var msg = {};
						msg.to_uin = +gid,
						msg.text = "亲，结果是：" + result;
						msg.id = msgId + 1;

						//if (group) { //群消息
						msg.type = 'groupmessage';
						//}

						libqq.sendMsg(msg, defer);

					}).then(function(e) {

					})

				}
			}
		} catch (e) {

		}
	});
}