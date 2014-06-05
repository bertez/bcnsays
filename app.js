/* global __dirname */
var express = require('express');
var twitter = require('twit');
var helpers = require('./helpers.js');

var app = express();

var server = app.listen(5002, 'localhost', function() {
	console.log('server started');
});

var io = require('socket.io').listen(server);

app.use('/static', express.static(__dirname + '/static'));

// Go to dev.twitter.com, create a new app and fill the credentials with the generated api key 
var credentials = {
	consumer_key: '',
	consumer_secret: '',
	access_token: '',
	access_token_secret: ''
};

try {
	var dev_config = require('./config.js');
	credentials = dev_config.credentials;
} catch(e) {
	console.log('Using default configuration');
}

var twit = new twitter(credentials);

// abaixo-esquerda - arriba-dereita [lon,lat,lon,lat]
var geoBox = [2.05236,41.312268,2.308004,41.472663];

var checkInBox = function (lon, lat) {

	if(lon < geoBox[0] || lon > geoBox[2]) {
		return false;
	}

	if(lat < geoBox[1] || lat > geoBox[3]) {
		return false;
	}

	return true;
};

var stream = twit.stream('statuses/filter', { 'locations': geoBox.join() });

stream.on('tweet', function (data) {
	if(data.coordinates !== null) {
		var lon = data.coordinates.coordinates[0];
		var lat = data.coordinates.coordinates[1];
		if(checkInBox(lon, lat)) {
			io.emit('tweet', {
				user: data.user.screen_name,
				text: data.text,
				loc: data.coordinates,
				url: 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str,
				image: data.user.profile_image_url,
				district: helpers.closest([lon, lat])
			});
		}
	}
});
stream.on('limit', function(msg) {
	console.log("Limited: " + msg);
});

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/districts.json', function (req, res) {
	res.json(helpers.districts);
});

