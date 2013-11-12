module.exports = function(libqq) {

	libqq.on('message', function(msg) {
		var account = libqq.getAccount();

		if(msg.text && msg.text.length > 0){
			var content = msg.text.trim();
			if(content === "logout"){
				console.log("退出QQ");
				libqq.logout();
			}
		}
	});
}