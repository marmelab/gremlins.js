require.config({
	packages: [
		{ name: 'gremlins', location: '../../src' },
	]
});

require(['gremlins','./hammer'], function(gremlins, Hammer) {
	var hammerProps,
		hammerEvents,
		hammerInst,
		testLogger;


	/**
	 * receive the element for the logger with some caching to speed things up
	 */
	var getLogElement = (function() {
		var cache = {};
		return function (type, name) {
			var el = cache[type + name];
			if(!el) {
				return cache[type + name] = document.getElementById('log-' + type + '-' + name);
			}
			return el;
		}
	})();


	/**
	 * round to 1 digit
	 * @param float
	 * @param [digits]
	 * @returns {number}
	 */
	function round(float, digits) {
		if(digits == null) {
			return Math.round(float);
		}
		var round = 10 * digits;
		return Math.round(float * round) / round;
	}


	/**
	 * highlight the triggered event and update the log values
	 * @param ev
	 */
	function logHammerEvent(ev) {
		if(!ev.gesture) {
			return;
		}

		// store last event, that should might match the gremlin
		if(ev.gesture.eventType == 'end') {
			testLogger.lastEvent = ev;
		}

		// highlight gesture
		var event_el = getLogElement('gesture', ev.type);
		event_el.className = 'active';

		for(var i = 0, len = hammerProps.length; i < len; i++) {
			var prop = hammerProps[i];
			var value = ev.gesture[prop];
			switch(prop) {
				case 'center':
					value = value.pageX + 'x' + value.pageY;
					break;
				case 'gesture':
					value = ev.type;
					break;
				case 'target':
					value = ev.gesture.target.tagName;
					break;
				case 'touches':
					value = ev.gesture.touches.length;
					break;
			}
			getLogElement('prop', prop).innerHTML = value;
		}
	}


	// all properties that are being shown on the page
	hammerProps = ['gesture', 'center', 'deltaTime', 'angle', 'direction',
		'distance', 'deltaX', 'deltaY', 'velocityX', 'velocityY', 'pointerType',
		'interimDirection', 'interimAngle',
		'scale', 'rotation', 'touches', 'target'];


	// get all the we want to listen to events from the list on the page
	hammerEvents = ['touch', 'release', 'hold', 'tap', 'doubletap', 'dragstart',
		'drag', 'dragend', 'dragleft', 'dragright', 'dragup', 'dragdown', 'swipe',
		'swipeleft', 'swiperight', 'swipeup', 'swipedown', 'transformstart',
		'transform', 'transformend', 'rotate', 'pinch', 'pinchin', 'pinchout'];


	// listen to all events for the logger
	hammerInst = Hammer(document.body, { prevent_default: true });
	hammerInst.on(hammerEvents.join(' '), logHammerEvent);


	// test if scale, rotation and directions are calculated correctly
	testLogger = {
		lastEvent: {},

		log: function(_, species) {
			switch(species.trim()) {
				case 'toucher':
					var details = arguments[6];
					var lastEvent = testLogger.lastEvent;
					if(lastEvent && lastEvent.gesture) {
						var lastGesture = lastEvent.gesture;
						console.group();
						console.log('deltax', round(lastGesture.deltaX), round(details.distanceX));
						console.log('deltay', round(lastGesture.deltaY), round(details.distanceY));
						console.log('scale', round(lastGesture.scale), round(details.scale));
						console.log('rotation', round(lastGesture.rotation), round(details.rotation));
						console.log(lastGesture, details);
						console.groupEnd();
					}
					break;
				default:
					console.log(arguments);
			}
		},

		info: function() { console.info(arguments); },
		warn:  function() { console.warn(arguments); },
		error: function() { console.error(arguments); }
	};


	// start!
	gremlins.createHorde()
		.gremlin(gremlins.species.toucher())
		.logger(testLogger)
		.mogwai(gremlins.mogwais.gizmo().maxErrors(2))
		.unleash();
});