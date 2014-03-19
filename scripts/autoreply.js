// var then = require("thenjs");
// var readline = require('readline');
// var _ = require("underscore");
// var moment = require("moment");
// var util = require("util");

// var msgId = 1989000;
module.exports = function(libqq) {}

//     libqq.on('sessmessage', function(message) {
//         var account = libqq.getAccount();

//         var qq = account.idmap[message.from.uin] || "";
//         message.from.qq = qq;

//         var msg = {};
//         msg.to_uin = +message.from.uin,
//         msg.text = message.from.nick + " 亲，请把消息发给@应用部-柳浩。";
//         msg.id = msgId + 1;

//         then(function(d) {
//             libqq.sendMsg(msg, d);
//         }).then(function(d) {

//         }, function(d, error) {
//             console.log(error);
//         })

//     });

//     libqq.on('message', function(message) {
//         var account = libqq.getAccount();

//         var qq = account.idmap[message.from.uin] || "";

//         if (+qq === 31580436) { ///特定用户的消息

//             var msg = {};
//             msg.to_uin = +message.from.uin,
//             msg.text = message.from.nick + " 亲，请把消息发给@应用部-柳浩。";
//             msg.id = msgId + 1;

//             then(function(d) {
//                 libqq.sendMsg(msg, d);
//             }).then(function(d) {

//             }, function(d, error) {
//                 console.log(error);
//             })
//         }

//     });
// }