/* global jQuery, io */
(function($){
	var socket = io.connect();

	var $log = $('#log');
	var $tl = $('#tweetlist');
	var $music = $('#music');
	var $sounds = $('#sounds');

	var areas = {
		'cv' : $('#cv'),
		'ei' : $('#ei'),
		'gr' : $('#gr'),
		'hg' : $('#hg'),
		'lc' : $('#lc'),
		'nb' : $('#nb'),
		'sa' : $('#sa'),
		'sm' : $('#sm'),
		'sn' : $('#sn'),
		'sr' : $('#sr')
	};

	var buttons = {};

	var windowWidth = $(window).width();
	var tweetbox = {};

	var loops = {
		'bs1': {
			element: $('#bs1')[0],
			volume: 0.2,
		},
		'bs2': {
			element: $('#bs2')[0],
			volume: 0.3
		},
		'bs3': {
			element: $('#bs3')[0],
			volume: 0.1
		}
	};

	$('#twitter').on('click', function() {
		window.open('https://twitter.com');
	});

	$('#infog').on('click', function() {
		$('#graphic').fadeIn();
	});

	$('#close').on('click', function() {
		$('#graphic').fadeOut();
	});

	var currentMusic;

	var switchMusic = function(id) {
		if(currentMusic) {
			currentMusic.element.pause();
		}

		loops[id].element.volume = loops[id].volume;
		loops[id].element.play();
		currentMusic = loops[id];
	};

	$music.on('click', function() {
		$sounds.fadeIn();
	});
	
	var noise = $('#city')[0];
	noise.volume = 0.1;
	noise.play();

	$sounds.find('li').on('click', function(e) {
		switchMusic($(this).data('id'));
		$sounds.fadeOut();
	});


	var fillTweets = function(list) {
		$tl.empty();
		if(list.length) {
			$.each(list, function(i, d) {
				var $tweet = $('<div>').addClass('tw');
				var $content = $('<img src="' + d.image + '"><span><strong>@' + d.user + ':</strong> ' + d.text + '</span>');
				$content.appendTo($tweet);
				$tweet.appendTo($tl);
			});
		} else {
			$('<span>No tweets yet</span>').appendTo($tl);
		}
	};

	var newEvent = function(id, data) {
		if(tweetbox[id].canplay) {
			var current = tweetbox[id];
			buttons[id].addClass('white');
			areas[id].addClass('high');
			var tbox= areas[id].find('div');
			tbox.html('<strong> ' + data.user + '</strong>' + data.text).show();
			setTimeout(function() {
				areas[id].removeClass('high');
				buttons[id].removeClass('white');
				tbox.hide();
			}, 1500);
			tweetbox[id].canplay = false;
			var audioFile = '/static/audio/' + id + '.ogg';
			var currentAudio = new Audio(audioFile);
			currentAudio.play();
			currentAudio.addEventListener('ended', function() {
				tweetbox[id].canplay = true;
			});
		}
	};

	$('#enter').on('click', function() {
		$('#intro').fadeOut('normal', function() {
			start();
		});
	});

	var start = function() {
		switchMusic('bs1');
		$.getJSON('/districts.json', function(districts) {
			$.each(districts, function(i, d) {
				tweetbox[d.id] = {
					canplay: true,
					enabled: true,
					tweets: []
				};

				var $district = $('<div>')
				.addClass('district')
				.data('enabled', true)
				.on('mouseover', function() {
					fillTweets(tweetbox[d.id].tweets);
					$tl.show();
					var pos = $(this).position().left + $tl.outerWidth() > windowWidth ? windowWidth - $tl.outerWidth() : $(this).position().left;
					$tl.css('left', pos);
				})
				.on('mouseout', function() {
					$tl.hide();
				})
				.on('click', function() {
					var $this = $(this);
					if($this.data('enabled')) {
						$this.css('background-color', '#999');
						$this.data('enabled', false);
						tweetbox[d.id].enabled = false;
					} else {
						$this.css('background-color', '#4e1e81');
						$this.data('enabled', true);
						tweetbox[d.id].enabled = true;
					}
				})
				.html(d.name);

				buttons[d.id] = $district;

				$district.appendTo($log);
			});

			socket.on('tweet', function (data) {
				if(tweetbox[data.district.id].enabled) {
					var box = tweetbox[data.district.id].tweets;
					box.push(data);
					newEvent(data.district.id, data);
					$('<img/>').attr('src', data.image);
					if(box.length > 10) {
						box.shift();
					}
				}

			});
		});
	}; // bootstrap function end


	$(window).on('resize', function() {
		windowWidth = $(window).width();
	});

}(jQuery));
