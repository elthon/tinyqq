var then = require("thenjs");
var readline = require('readline');
var _ = require("underscore");
var moment = require("moment");
var util = require("util");

var request = require("request");

module.exports = function(libqq) {

	var msgHandler = function(message) {
		var account = libqq.getAccount();

		var qq = account.idmap[message.from.uin] || "";

		// if (+qq === 31580436) { ///特定用户的消息
		// 	return;
		// }

		var input = message.text;


		var options = {
			hostname: 'cloud.xiaoi.com',
			port: 80,
			path: '/api',
			method: 'POST',
			headers: {
				"Referer": "http://cloud.xiaoi.com/apiDebug.jsp?key=NIJg8X5Ik8PF&secret=fBlwNNdUHOSKU03ScOVN",
				"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36",
				"X-Requested-With": "XMLHttpRequest"
			}
		};


		var req = http.request(options, function(res) {
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				console.log('BODY: ' + chunk);
			});
			res.on('close', function() {

			})
		});

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
		// write data to request body
		req.write('data\n');
		req.end();

		request.post({
			url: "http://cloud.xiaoi.com/api",
			json: true,
			headers: {
				"Referer": "http://cloud.xiaoi.com/apiDebug.jsp?key=NIJg8X5Ik8PF&secret=fBlwNNdUHOSKU03ScOVN",
				"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36",
				"X-Requested-With": "XMLHttpRequest"
			}

		}, function(err, res, body) {
			console.log(body, err);

			var nonce = body.nonce;
			var signature = body.status;

			request.post({
				url: "http://nlp.xiaoi.com/ask.do?platform=custom",
				headers: {
					"X-Auth": "app_key=\"NIJg8X5Ik8PF\", nonce=\"" + nonce + "\", signature=\"" + signature + "\"",
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36",
					"Referer": "http://nlp.xiaoi.com/invoke.html?ts=1385304672062",
					"X-Requested-With": "XMLHttpRequest"
				}

			}, function(err, res, body) {
				//var account = libqq.getAccount();
				if (message.type == 'groupmessage') {
					var group = account.qun[message.from_uin];
					if (group.name.match(/eefung/g)) {
						console.log("忽略antvision群");
						return;
					}
				}

				var msg = {};
				msg.text = input;
				msg.id = libqq.getMsgId();
				if (message.type == 'groupmessage') {
					msg.type = 'groupmessage';
					msg.to_uin = +message.from_uin;
				} else {
					msg.to_uin = +message.from.uin;
				}

				then(function(d) {
					console.log(msg);
					var send = function() {
						libqq.sendMsg(msg, d)
					};
					_.delay(send, 1000);
				}).then(function(d) {

				}, function(d, error) {
					console.log(error);
				})

			}).form({
				userId: "api-cdtzgakj",
				question: input,
				type: 0
			})
		}).form({
			app_secret: "fBlwNNdUHOSKU03ScOVN",
			app_key: "NIJg8X5Ik8PF"
		})



	};

	//libqq.on("groupmessage", msgHandler);
	//libqq.on("message", msgHandler);
}