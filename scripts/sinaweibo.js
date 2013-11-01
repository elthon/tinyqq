var then = require("thenjs");
var request = require("request");
var _ = require("underscore");

var msgId = 6000;

module.exports = function(libqq) {

	libqq.on("groupmessage", function(msg) {

		try {
			var account = libqq.getAccount();

			var gid = msg.from_uin;
			var group = account.qun[msg.from_uin];

			var text = msg.text.trim();

			if (text.length > 0) {

				if (text.match(/^sina_public$/g)) {

					then(function(defer) {
						var opt = {
							url: "https://api.weibo.com/2/statuses/public_timeline.json?access_token=2.00XcaXJCGWtRIC227ac54f7ch6aJtD",
							json: true
						}
						request.get(opt, function(error, res, body) {

							var weibo = [];

							var cache = {};
							_.each(body.statuses, function(status) {
								if (cache[status.id]) {
								} else {
									cache[status.id] = status.id;
									weibo.push(status.created_at + " - " + status.id + "(" + status.user.screen_name + "/" + status.user.name + ")" + status.text);
								}
							})

							defer(null, weibo);
						})
					}).then(function(defer, weibo) {

						// weibo = weibo.slice(0, 1);

						var sendEach = function(weiboList) {
							if (weiboList && weiboList.length > 0) {
								var wb = weiboList.splice(0,1);

								var msg = {};

								msg.to_uin = +gid,
								msg.text = wb[0];
								msg.id = msgId + 1;

								if (group) { //群消息
									msg.type = 'groupmessage';
								}
								then(function(d) {
									libqq.sendMsg(msg, d);
								}).then(function(d) {
									setTimeout(sendEach(weiboList), 3000);
								})
							}
						}

						sendEach(weibo);

					}).then(function(defer) {
						console.log("< _ > 消息发送成功。");
					}, function(defer, error) {
						console.log(":-> 消息发送失败。", error);
					});
				}
			}
		} catch (e) {
			console.log(e);
		}

	});

}