require.config({
	packages: [
		{ name: 'gremlins', location: '../../src' }
	]
	/*
	 // alternative: use the packaged version
	 paths: {
	 gremlins:  '../../gremlins.min'
	 }
	 */
});

require(['gremlins'], function(gremlins) {
	// start!
	window.horde = gremlins.createHorde();

	horde
		.gremlin(gremlins.species.toucher())
		.logger(hammerTest)
		.mogwai(gremlins.mogwais.gizmo().maxErrors(2))
		.unleash();
});


// test if scale, rotation and angle calculations are correct
var hammerTest = {
	lastEvent: {},

	log: function(_, species, gremlin) {
		switch(species) {
			case 'toucher':
				var lastEvent = hammerTest.lastEvent;

				if(lastEvent && lastEvent.gesture) {
					var lastGesture = lastEvent.gesture;

					console.log('angle', lastGesture.angle, gremlin.gesture.angle);
					console.log('scale', lastGesture.scale, gremlin.gesture.scale);
					console.log('rotation', lastGesture.rotation, gremlin.gesture.rotation);
				}
				break;
			default:
				console.log(arguments);
		}
	}
};


// log properties
var properties = ['gesture', 'center', 'deltaTime', 'angle', 'direction',
	'distance', 'deltaX', 'deltaY', 'velocityX', 'velocityY', 'pointerType',
	'interimDirection', 'interimAngle',
	'scale', 'rotation', 'touches', 'target'];


// shortcut
function getEl(id) { return document.getElementById(id); }

var __log_elements = {};
function getLogElement(type, name) {
	var el = __log_elements[type + name];
	if(!el) {
		return __log_elements[type + name] = getEl("log-" + type + "-" + name);
	}
	return el;
}


function logEvent(ev) {
	if(!ev.gesture) {
		return;
	}

	// store last event, that should might match the gremlin
	hammerTest.lastEvent = ev;

	// highlight gesture
	var event_el = getLogElement('gesture', ev.type);
	event_el.className = "active";

	for(var i = 0, len = properties.length; i < len; i++) {
		var prop = properties[i];
		var value = ev.gesture[prop];
		switch(prop) {
			case 'center':
				value = value.pageX + "x" + value.pageY;
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

// get all the events
var all_events = [];
all_events.forEach.call(document.querySelectorAll("#events-list li"), function(li) {
	var type = li.textContent;
	li.setAttribute("id", "log-gesture-" + type);
	all_events.push(type);
});

// listen to all events for the logger
var hammertime = Hammer(document.body, { prevent_default: true });
hammertime.on(all_events.join(" "), logEvent);