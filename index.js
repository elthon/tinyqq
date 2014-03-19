var TinyQQ = require("./lib/tinyqq.js");

var cluster = require('cluster');

var _ = require("underscore");
var fs = require("fs");

if (cluster.isMaster) {
        cluster.fork();
         cluster.on('exit', function(worker, code, signal) {
                 console.log('worker ' + worker.process.pid + ' died');
                cluster.fork();
        });
}else{
		var auth = require("./lib/auth.js");
		console.log("auths" , auth);

		_.each(auth.accounts, function(account){
			var defaultDir = "data/"+account.uin;
			//创建account的专属目录
			fs.mkdir(defaultDir, function(){
				account.dataDir = defaultDir;
				tinyQQ = new TinyQQ(account);	
			})
		})
}