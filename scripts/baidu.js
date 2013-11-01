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
			}
		}catch(e)
		{
			
		}
	});
}