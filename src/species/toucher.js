/**
 * The toucher gremlin touches anywhere on the visible area of the document
 *
 * The toucher gremlin triggers touch events (touchstart, touchmove, touchcancel
 * and touchend), by doing gestures on random targets displayed on the viewport.
 *
 * By default, the touch gremlin activity is showed by a blue circle.
 *
 *   var toucherGremlin = gremlins.species.toucher();
 *   horde.gremlin(toucherGremlin);
 *
 * The toucher gremlin can be customized as follows:
 *
 *   toucherGremlin.touchTypes(['tap', 'gesture']); // the mouse event types to trigger
 *   toucherGremlin.positionSelector(function() { // find a random pair of coordinates to touch });
 *   toucherGremlin.showAction(function(x, y) { // show the gremlin activity on screen });
 *   toucherGremlin.canTouch(function(element) { return true }); // to limit where the gremlin can touch
 *   toucherGremlin.maxNbTries(5); // How many times the gremlin must look for a touchable element before quitting
 *   toucherGremlin.logger(loggerObject); // inject a logger
 *   toucherGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.toucher()
 *     .touchTypes(['gesture'])
 *     .positionSelector(function() {
 *        // only touch inside the foo element area
 *        var $el = $('#foo');
 *        var offset = $el.offset();
 *        return [
 *          parseInt(Math.random() * $el.outerWidth() + offset.left),
 *          parseInt(Math.random() * $el.outerHeight() + offset.top)
 *        ];
 *     })
 *     . showAction(function(x, y) {
 *       // do nothing (hide the gremlin action on screen)
 *     })
 *   );
 */
define(function(require) {
	"use strict";

	var configurable = require('../utils/configurable');
	var Chance = require('../vendor/chance');

	return function() {

		var document = window.document,
			body = document.body;

		var defaultTouchTypes = ['tap', 'gesture', 'doubletap', 'tap', 'gesture', 'gesture', 'gesture', 'multitouch', 'multitouch'];

		var defaultPositionSelector = function() {
			return [
				config.randomizer.natural({ max: document.documentElement.clientWidth - 1 }),
				config.randomizer.natural({ max: document.documentElement.clientHeight - 1 })
			];
		};

		var defaultShowAction = function(touches) {
			touches.forEach(function(touch) {
				var touchSignal = document.createElement('div');
				touchSignal.style.border = "3px solid blue";
				touchSignal.style['border-radius'] = '50%'; // Chrome
				touchSignal.style.borderRadius = '50%';     // Mozilla
				touchSignal.style.width = "40px";
				touchSignal.style.height = "40px";
				touchSignal.style['box-sizing'] = 'border-box';
				touchSignal.style.position = "absolute";
				touchSignal.style.webkitTransition = 'opacity .5s ease-out';
				touchSignal.style.mozTransition = 'opacity .5s ease-out';
				touchSignal.style.transition = 'opacity .5s ease-out';
				touchSignal.style.left = (touch.x - 20 ) + 'px';
				touchSignal.style.top = (touch.y - 20 ) + 'px';

				var element = body.appendChild(touchSignal);
				setTimeout(function() {
					body.removeChild(element);
				}, 500);
				setTimeout(function() {
					element.style.opacity = 0;
				}, 50);
			});
		};

		var defaultCanTouch = function() {
			return true;
		};

		/**
		 * @mixin
		 */
		var config = {
			touchTypes: defaultTouchTypes,
			positionSelector: defaultPositionSelector,
			showAction: defaultShowAction,
			canTouch: defaultCanTouch,
			maxNbTries: 10,
			logger: {},
			randomizer: new Chance(),
			minTouches: 1,
			maxTouches: 4
		};


		/**
		 * generate a list of x/y around the center
		 * @param center
		 * @param points
		 * @param [radius=100]
		 * @param [rotation=0]
		 */
		function getTouches(center, points, radius, rotation) {
			var cx = center[0],
				cy = center[1],
				touches = [],
				slice, i, angle;

			radius = radius || 100;
			rotation = rotation || 0;
			slice = 2 * Math.PI / points;

			// just one touch, at the center
			if(points === 1) {
				return [
					{x: cx, y: cy}
				];
			}

			for(i = 0; i < points; i++) {
				angle = slice * i + rotation;
				touches.push({
					x: (cx + radius * Math.cos(angle)),
					y: (cy + radius * Math.sin(angle))
				});
			}
			return touches;
		}


		/**
		 * trigger a gesture
		 * @param element
		 * @param startPosition
		 * @param startTouches
		 * @param gesture
		 * @param cb
		 */
		function triggerGesture(element, startPosition, startTouches, gesture, done) {
			var interval = 10,
				loops = Math.floor(gesture.duration / interval),
				loop = 0;

			triggerTouch(startTouches, element, 'start');

			function gestureLoop() {
				loop++;

				var scale = gesture.radius * (gesture.scale / loops * loop),
					rotation = (gesture.scale / loops * loop),
					posX = startPosition[0] + (gesture.distanceX / loops * loop),
					posY = startPosition[1] + (gesture.distanceY / loops * loop),
					touches = getTouches([posX, posY], startTouches.length, scale, rotation),
					is_last = (loop === loops - 1);

				if(!is_last) {
					triggerTouch(touches, element, 'move');
					setTimeout(gestureLoop, 10);
				}
				else {
					triggerTouch(touches, element, 'end');
					done(touches)
				}
			}

			setTimeout(gestureLoop, 10);


		}


		/**
		 * trigger a touchevent
		 * @param touches
		 * @param element
		 * @param type
		 */
		function triggerTouch(touches, element, type) {
			var event = document.createEvent('Event');
			event.initEvent('touch' + type, true, true);

			var touchlist = [];

			// just like the mobile browsers, on touchend we dont include a touchlist
			if(type != 'end') {
				touches.forEach(function(touch, i) {
					touchlist.push({
						pageX: touch.x,
						pageY: touch.y,
						clientX: touch.x,
						clientY: touch.y,
						target: element,
						identifier: i
					})
				});
			}

			event.touches = touchlist;
			event.changedTouches = touchlist;

			element.dispatchEvent(event);

			config.showAction(touches);
		}


		/**
		 * diffent kind of gestures
		 */
		var touchTypes = {
			/**
			 * tap, like a click event, only 1 touch
			 * could also be a slow tap, that could turn out to be a hold
			 */
			tap: function(position, element, done) {
				var touches = getTouches(position, 1),
					gesture = {
						duration: config.randomizer.natural({ min: 20, max: 700 })
					};

				triggerTouch(touches, element, 'start');

				setTimeout(function() {
					triggerTouch(touches, element, 'end');
					done(touches, gesture);
				}, gesture.duration);
			},


			/**
			 * doubletap, like a dblclick event, only 1 touch
			 * could also be a slow doubletap, that could turn out to be a hold
			 */
			doubletap: function(position, element, done) {
				touchTypes.tap(position, element, function() {
					setTimeout(function() {
						touchTypes.tap(position, element, done);
					}, 30);
				});
			},


			/**
			 * single touch gesture, could be a drag and swipe, with 1 points
			 */
			gesture: function(position, element, done) {
				var points = 1,
					gesture = {
						radius: config.randomizer.natural({ min: 100, max: 200 }),
						distanceX: config.randomizer.natural({ min: -100, max: 200 }),
						distanceY: config.randomizer.natural({ min: -100, max: 200 }),
						angle: config.randomizer.natural({ min: -200, max: 200 }),
						duration: config.randomizer.natural({ min: 20, max: 500 })
					},
					touches = getTouches(position, points, gesture.radius);

				triggerGesture(element, position, touches, gesture, function(touches) {
					done(touches, gesture);
				});
			},

			/**
			 * multitouch gesture, could be a drag, swipe, pinch and rotate, with 2 or more points
			 */
			multitouch: function(position, element, done) {
				var points = config.randomizer.natural({min: 2, max: config.maxTouches}),
					scale = (points === 1) ? 1 : config.randomizer.floating({ min: 0.1, max: 2 }),
					rotate = (points === 1) ? 0 : config.randomizer.floating({ min: -300, max: 300 }),
					gesture = {
						scale: scale,
						rotate: rotate,
						radius: config.randomizer.natural({ min: 100, max: 200 }),
						distanceX: config.randomizer.natural({ min: -100, max: 200 }),
						distanceY: config.randomizer.natural({ min: -100, max: 200 }),
						angle: config.randomizer.natural({ min: -200, max: 200 }),
						duration: config.randomizer.natural({ min: 100, max: 1500 })
					},
					touches = getTouches(position, points, gesture.radius);

				triggerGesture(element, position, touches, gesture, function(touches) {
					done(touches, gesture);
				});
			}
		};


		/**
		 * @mixes config
		 */
		function toucherGremlin(done) {
			var position,
				posX, posY,
				targetElement,
				nbTries = 0;

			do {
				position = config.positionSelector();
				posX = position[0];
				posY = position[1];
				targetElement = document.elementFromPoint(posX, posY);
				nbTries++;
				if(nbTries > config.maxNbTries) return false;
			} while(!targetElement || !config.canTouch(targetElement));


			var touchType = config.randomizer.pick(config.touchTypes);
			touchTypes[touchType](position, targetElement, logGremlin);

			function logGremlin(touches, details) {
				if(typeof config.showAction == 'function') {
					config.showAction(touches);
				}
				if(typeof config.logger.log == 'function') {
					config.logger.log('gremlin', 'toucher', touchType, 'at', posX, posY, details);
				}
				done();
			}
		}

		configurable(toucherGremlin, config);

		return toucherGremlin;
	};
});
