var request = require("request");
var then = require("thenjs");
var _ = require("underscore");

module.exports = function(libqq) {



	//定期检查是否有新消息！
	var checkMsg = function() {

		request.get({
			url: "http://100.42.229.234:3000/index.json?access_token=johncf1981$$",
			json: true
		}, function(err, res, body) {

			console.log(body);
			if (body.text) {

				var qunMap = libqq.getAccount().qun;
				var keys = _.keys(qunMap);
				var key = _.find(keys, function(num){ return qunMap[num].name == 'QQ蚂蚁群' });

				//发送信息到群里面去。
				var msg = {};
				msg.to_uin = +key,
				msg.text = body.text + " - " + body.url;
				msg.id = libqq.getMsgId();
				msg.type = 'groupmessage';

				then(function(d) {
					//libqq.sendMsg(msg, d);
				}).then(function(d) {
					setTimeout(checkMsg, 500);
				}, function(d, error) {
					console.log(error);
					setTimeout(checkMsg, 500);
				})
			}


		})

	}

	checkMsg();
}