var util = require('util'),
    twitter = require('twitter'),
    _ = require("underscore"),
    request = require("request");

var express = require('express');
var app = express();

var twit = new twitter({
    consumer_key: 'tJeYtkoJqBgHByXuEnhIA',
    consumer_secret: 't6fimDp2oYBXxTKwDCzlQLM0AylccE5bXRlCzGHcO8',
    access_token_key: '23031697-4oZRZil3PFeyfTmUKHK5rCuTTWe3O9L58ILafUaOZ',
    access_token_secret: 'TibZEr2ra0vad2T2hBSOSwAnSm8pN4sVLP7tsPqB2apl0'
});
//twit.search('nodejs OR apache', function(data) {
//    console.log(util.inspect(data));
//});

var mqueue = [];
twit.stream('statuses/filter', {
    track: 'china'
}, function(stream) {
    stream.on('data', function(data) {
        //       console.log(util.inspect(data));
        var media = data.entities.media;
        if (media && media.length > 0) {
            // _.each(media, function(m) {
            //     console.log(m)
            // });
            var status = {
                "text": data.text,
                "url": media[0].media_url
            };
            console.log(status)
            mqueue.push(status);
        }
    });
});

app.use(express.bodyParser());
app.get("/index.json", function(req, res) {
    var token = req.param("access_token");
    if (token && token == "johncf1981$$") {

        var data = mqueue.splice(0, 1);

        res.status(200);
        res.set('Content-Type', 'application/json;charset=UTF-8');
        if (data) {
            console.log("mqueue size = ", mqueue.length);
            res.send(data);
        } else {
            res.send("{}");
        }
    }else{
        res.send("{}");
    }
});
app.listen(3000);