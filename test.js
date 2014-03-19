var moment = require("moment");
var time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
console.log(time)


var fetchP = function(){
	var req = require("request");
	req.get("http://0.web.qstatic.com/webqqpic/pubapps/0/50/eqq.all.js", function(err, res, body){
		
		var i = body.indexOf("P=function(");
		var e = body.indexOf(",b=function(");
		var p = body.substring(i,e)
		var fun = p.substring("P=function(b,i){".length, p.length-1);

		var fun1 = new Function('b','i', fun);

		var res = fun1('1462731540','9ec8df8f766cd713174411a4ff5d9c6e37e1a2551f8bed75f2154c65d27780702124f6939efeeea9');
		console.log(res);

	});
}

fetchP();