# gremlins.js

gremlins.js is a monkey testing library written in JavaScript, for Node.js and the browser. Use it to check the robustness of web applications by unleashing a horde of undisciplined gremlins.


> Kate: *What are they, Billy?*
>
> Billy Peltzer: *They're gremlins, Kate, just like Mr. Futterman said.*

## Basic Usage

A gremlins "horde" is an army of specialized gremlins ready to mess with your application. This library provides several gremlin species: some gremlins click everywhere on the page, others enter data in form inputs, others scroll the window in every posible direction, etc. "unleash" the gremlins horde to start the stress test.

```js
var horde = gremlins.createHorde()
horde.unleash();
// every gremlin will act 100 times, at 10 ms interval
```

You will see traces of the gremlins actions on the screen (they leave red traces) and in the console log:

```
gremlin formFiller input 5 in <input type=​"number" name=​"age">​
gremlin formFiller input pzdoyzshh0k9@o8cpskdb73nmi.r7r in <input type=​"email" name=​"email">​
gremlin clicker    click at 1219 301
gremlin scroller   scroll to 100 25 
...
```

A horde also contains mogwais, which are harmless gremlins (or, you could say that gremlins are harmful mogwais). Mogwais only monitor the activity of the application and record it on the logger. For instance, the "fps" mogwai monitors the number of frame per second every 500ms:

```
mogwai  fps  33.21
mogwai  fps  59.45
mogwai  fps  7.5
mogwai  fps  12.67
...
```

Gremlins, just like mogwais, are simple JavaScript functions. So you can breed your own species very easily:

```js
// add a new custom gremlin to blur the currently focused element
horde.gremlin(function() {
  document.activeElement.blur();
});
```

## Installation

In the browser, the `gremlins.min.js` file can be used as a standalone library and adds `gremlins` to the global namespace:

```html
<script src="path/to/gremlins.min.js"></script>
<script>
gremlins.createHorde().unleash();
</script>
```

Alternately, you can include `gremlins.min.js` as a RequireJS module, leaving the global namespace clean:

```js
require.config({
  paths: { 
	gremlins: 'path/to/gremlins.min'
  }
});

require(['gremlins'], function(gremlins) {
  gremlins.createHorde().unleash();
});
```

## Advanced Usage

### Adding Gremlins and Mogwais

By default, all gremlins and mogwais species are added to the horde. 

You can also choose to add only the gremlins species you want, using the `gremlin()` function of the `horde` object:

```js
gremlins.createHorde()
  .gremlin(gremlins.species.formFiller())
  .gremlin(gremlins.species.clicker().clickTypes(['click']))
  .gremlin(gremlins.species.scroller())
  .gremlin(function() {
    window.$ = function() {};
  })
  .unleash();
```

If you just want to add your own gremlins in addition to the default ones, use the `allGremlins()` function:

```js
gremlins.createHorde()
  .allGremlins()
  .gremlin(function() {
    window.$ = function() {};
  })
  .unleash();
```

To add just the mogwais you want, use the `mogwai()` and `allMogwais()` method the same way.

### Customizing The Logger

By default, gremlins.js logs all gremlin actions and mogwai observations in the console. If you prefer using an alternative logging method (for instance, storing gremlins activity in LocalStorage and sending it in Ajax once every 10 seconds), just provide a logger object with 4 methods (log, info, warn, and error) to the `logger()` method:

```js
var customLogger = {
  log:   function(msg) { /* .. */ },
  info:  function(msg) { /* .. */ },
  warn:  function(msg) { /* .. */ },
  error: function(msg) { /* .. */ }
};
horde.logger(customLogger);
```

**Tip**: instead of reimplementing your custom logger, you may want to look at [Minilog](https://github.com/mixu/minilog).
