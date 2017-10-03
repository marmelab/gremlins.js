# gremlins.js

gremlins.js is a monkey testing library written in JavaScript, for Node.js and the browser. Use it to check the robustness of web applications by unleashing a horde of undisciplined gremlins.


> Kate: *What are they, Billy?*
>
> Billy Peltzer: *They're gremlins, Kate, just like Mr. Futterman said.*

![TodoMVC attacked by gremlins](http://static.marmelab.com/todo.gif)

## Purpose

While developing an HTML5 application, did you anticipate uncommon user interactions? Did you manage to detect and patch all memory leaks? If not, the application may break sooner or later. If n random actions can make an application fail, it's better to acknowledge it during testing, rather than letting users discover it.

Gremlins.js simulates random user actions: gremlins click anywhere in the window, enter random data in forms, or move the mouse over elements that don't expect it. Their goal: triggering JavaScript errors, or making the application fail. If gremlins can't break an application, congrats! The application is robust enough to be released to real users.

This practice, also known as [Monkey testing](http://en.wikipedia.org/wiki/Monkey_test) or [Fuzz testing](http://en.wikipedia.org/wiki/Fuzz_testing), is very common in mobile application development (see for instance the [Android Monkey program](http://developer.android.com/tools/help/monkey.html)). Now that frontend (MV*, d3.js, Backbone.js, Angular.js, etc.) and backend (Node.js) development use persistent JavaScript applications, this technique becomes valuable for web applications.

## Basic Usage

A gremlins *horde* is an army of specialized gremlins ready to mess up your application. *unleash* the gremlins to start the stress test:

```js
var horde = gremlins.createHorde();
horde.unleash();
// gremlins will act randomly, at 10 ms interval, 1000 times
```

`gremlins.js` provides several gremlin *species*: some click everywhere on the page, others enter data in form inputs, others scroll the window in every possible direction, etc.

You will see traces of the gremlins actions on the screen (they leave red traces) and in the console log:

```
gremlin formFiller input 5 in <input type=​"number" name=​"age">​
gremlin formFiller input pzdoyzshh0k9@o8cpskdb73nmi.r7r in <input type=​"email" name=​"email">​
gremlin clicker    click at 1219 301
gremlin scroller   scroll to 100 25
...
```

A horde also contains *mogwais*, which are harmless gremlins (or, you could say that gremlins are harmful mogwais). Mogwais only monitor the activity of the application and record it on the logger. For instance, the "fps" mogwai monitors the number of frame per second, every 500ms:

```
mogwai  fps  33.21
mogwai  fps  59.45
mogwai  fps  12.67
...
```

Mogwais also report when gremlins break the application. For instance, if the number of frames per seconds drops below 10, the fps mogwai will log an error:

```
mogwai  fps  12.67
mogwai  fps  23.56
err > mogwai  fps  7.54 < err
mogwai  fps  15.76
...
```

After 10 errors, a special mogwai stops the test. He's called *Gizmo*, and he prevents gremlins from breaking applications bad. After all, once gremlins have found the first 10 errors, you already know what you have to do to make your application more robust.

If not stopped by Gizmo, the default horde stops after roughly 1 minute. You can increase the number of gremlins actions to make the attack last longer:

```js
horde.unleash({ nb: 10000 });
// gremlins will attack at 10 ms interval, 10,000 times
```

Gremlins, just like mogwais, are simple JavaScript functions. If `gremlins.js` doesn't provide the gremlin that can break your application, it's very easy to develop it:

```js
// add a new custom gremlin to blur the currently focused element
horde.gremlin(function() {
  document.activeElement.blur();
});
```

Check the [examples](examples) directory for examples.

Everything in `gremlins.js` is configurable ; you will find it very easy to extend and adapt to you use cases.

## Installation

In the browser, the `gremlins.min.js` file can be used as a standalone library, and adds `gremlins` to the global namespace:

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

`gremlins.js` is also available as a **bookmarklet**. Go to [this page](https://rawgithub.com/marmelab/gremlins.js/master/bookmarklet.html), grab it, and unleash hordes on any web page.

## Advanced Usage

### Setting Gremlins and Mogwais To Use In A Test

By default, all gremlins and mogwais species are added to the horde.

You can also choose to add only the gremlins species you want, using the `gremlin()` function of the `horde` object:

```js
gremlins.createHorde()
  .gremlin(gremlins.species.formFiller())
  .gremlin(gremlins.species.clicker().clickTypes(['click']))
  .gremlin(gremlins.species.toucher())
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

`gremlins.js` currently provides a few gremlins and mogwais:

* [clickerGremlin](src/species/clicker.js) clicks anywhere on the visible area of the document
* [toucherGremlin](src/species/toucher.js) touches anywhere on the visible area of the document
* [formFillerGremlin](src/species/formFiller.js) fills forms by entering data, selecting options, clicking checkboxes, etc
* [scrollerGremlin](src/species/scroller.js) scrolls the viewport to reveal another part of the document
* [typerGremlin](src/species/typer.js) types keys on the keyboard
* [alertMogwai](src/mogwais/alert.js) prevents calls to alert() from blocking the test
* [fpsMogwai](src/mogwais/fps.js) logs the number of frames per seconds (FPS) of the browser
* [gizmoMogwai](src/mogwais/gizmo.js) can stop the gremlins when they go too far

### Configuring Gremlins

All the gremlins and mogwais provided by `gremlins.js` are *configurable functions*, i.e. you can alter the way they work by calling methods on them.

For instance, the clicker gremlin is a function that you can execute it directly:

```js
var clickerGremlin = gremlins.species.clicker();
clickerGremlin(); // trigger a random mouse event in the screen:
```

In JavaScript, functions are objects, and as such can have methods. The clicker gremlin function offers customizing methods:

```js
gremlins.species.clicker()
  .clickTypes(['click']) // which mouse event types will be triggered
  .canClick(function(element) {
    // only click elements in bar
    return $(element).parents('#bar').length;
    // when canClick returns false, the gremlin will look for another
    // element to click on until maxNbTries is reached
  })
  .showAction(function(x, y) {
    // by default, the clicker gremlin shows its action by a red circle
    // overriding showAction() with an empty function makes the gremlin action invisible
  })
```

Each particular gremlin or mogwai has its own customization methods, check the source for details.

**Tip**: For more information on configurable functions check [this blog post about service closures](http://redotheweb.com/2013/11/13/from-objects-to-functions-service-closures.html).

### Seeding The Randomizer

If you want the attack to be repeatable, you need to seed the random number generator. Gremlins.js depends on [Chance.js](http://chancejs.com/) for random data generation, so it supports seeding:

```js
// seed the randomizer
horde.seed(1234);
```

### Executing Code Before or After The Attack

Before starting the attack, you may want to execute custom code. This is especially useful to:

* Start a profiler
* Disable some features to better target the test
* Bootstrap the application

For this usage, the `horde` object provides a `before()` method, which accepts a callback:

```js
horde.before(function startProfiler() {
  console.profile('gremlins');
});
```

To clean up the test environment, the `horde` object also provides an `after()` method.

```js
horde.after(function stopProfiler() {
  console.profileEnd();
});
```

Both `before()` and `after()` support asynchronous callbacks:

```js
horde.before(function waitFiveSeconds(done) {
  window.setTimeout(done, 5000);
});
```

### Setting Up a Strategy

By default, gremlins will attack in random order, in a uniform distribution, separated by a delay of 10ms. This attack strategy is called the [distribution](src/strategies/distribution.js) strategy. You can customize it using the `horde.strategy()` method:

```js
horde.strategy(gremlins.strategies.distribution()
  .delay(50) // wait 50 ms between each action
  .distribution([0.3, 0.3, 0.3, 0.1]) // the first three gremlins have more chances to be executed than the last
)
```

Note that if using default gremlins, there are [five type of gremlins](https://github.com/marmelab/gremlins.js/blob/master/src/main.js#L12). The previous example would give a 0 value to last gremlin specie.

You can also use another strategy. A strategy is just a callback expecting three parameters: an array of gremlins, a parameter object (the one passed to `unleash()`), and a final callback. Two other strategies are bundled ([allTogether](src/strategies/allTogether.js) and [bySpecies](src/strategies/bySpecies.js)), and it should be fairly easy to implement a custom strategy for more sophisticated attack scenarios.

### Stopping The Attack

The horde can stop the attack in case of emergency using the `horde.stop()` method. Gizmo uses this method to prevent further damages to the application after 10 errors, and you can use it, too, if you don't want the attack to continue.

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

**Tip**: Instead of reimplementing your custom logger, you may want to look at [Minilog](https://github.com/mixu/minilog).

## Contributing

Your feedback about the usage of gremlins.js in your specific context is valuable, don't hesitate to [open GitHub Issues](https://github.com/marmelab/gremlins.js/issues) for any problem or question you may have.

All contributions are welcome. New gremlins, new mogwais, new strategies, should all be tested against the two examples bundled in the application. Try to follow the functional programming style. Also, don't forget to rebuild the minified version of the library using `make`.

While developing, you can use the command `make watch` to prevent from rebuilding at each step. In this case, just include the library using:

``` html
<script src="http://localhost:8080/gremlins.min.js"></script>
```

To build library, use `make build`.

## License

gremlins.js is licensed under the [MIT Licence](LICENSE), courtesy of [marmelab](http://marmelab.com).
