# gremlins.js

gremlins.js is a monkey testing library written in JavaScript, for Node.js and the browser. Use it to check the robustness of web applications by unleashing a horde of undisciplined gremlins.

> Kate: _What are they, Billy?_
>
> Billy Peltzer: _They're gremlins, Kate, just like Mr. Futterman said._

![TodoMVC attacked by gremlins](http://static.marmelab.com/todo.gif)

## Purpose

While developing an HTML5 application, did you anticipate uncommon user interactions? Did you manage to detect and patch all memory leaks? If not, the application may break sooner or later. If n random actions can make an application fail, it's better to acknowledge it during testing, rather than letting users discover it.

Gremlins.js simulates random user actions: gremlins click anywhere in the window, enter random data in forms, or move the mouse over elements that don't expect it. Their goal: triggering JavaScript errors, or making the application fail. If gremlins can't break an application, congrats! The application is robust enough to be released to real users.

This practice, also known as [Monkey testing](http://en.wikipedia.org/wiki/Monkey_test) or [Fuzz testing](http://en.wikipedia.org/wiki/Fuzz_testing), is very common in mobile application development (see for instance the [Android Monkey program](http://developer.android.com/tools/help/monkey.html)). Now that frontend (MV\*, d3.js, Backbone.js, Angular.js, etc.) and backend (Node.js) development use persistent JavaScript applications, this technique becomes valuable for web applications.

## Basic Usage

A gremlins _horde_ is an army of specialized gremlins ready to mess up your application. _unleash_ the gremlins to start the stress test:

```js
const horde = gremlins.createHorde();
horde.unleash();
// gremlins will act randomly, at 10 ms interval, 1000 times
```

`gremlins.js` provides several gremlin _species_: some click everywhere on the page, others enter data in form inputs, others scroll the window in every possible direction, etc.

You will see traces of the gremlins actions on the screen (they leave red traces) and in the console log:

```
gremlin formFiller input 5 in <input type=​"number" name=​"age">​
gremlin formFiller input pzdoyzshh0k9@o8cpskdb73nmi.r7r in <input type=​"email" name=​"email">​
gremlin clicker    click at 1219 301
gremlin scroller   scroll to 100 25
...
```

A horde also contains _mogwais_, which are harmless gremlins (or, you could say that gremlins are harmful mogwais). Mogwais only monitor the activity of the application and record it on the logger. For instance, the "fps" mogwai monitors the number of frame per second, every 500ms:

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

After 10 errors, a special mogwai stops the test. He's called _Gizmo_, and he prevents gremlins from breaking applications bad. After all, once gremlins have found the first 10 errors, you already know what you have to do to make your application more robust.

If not stopped by Gizmo, the default horde stops after roughly 1 minute. You can increase the number of gremlins actions to make the attack last longer:

```js
horde.createHorde({
    strategies: [gremlins.strategies.allTogether({ nb: 10000 })],
});
horde.unleash();
// gremlins will attack at 10 ms interval, 10,000 times
```

Gremlins, just like mogwais, are simple JavaScript functions. If `gremlins.js` doesn't provide the gremlin that can break your application, it's very easy to develop it:

```js
// Create a new custom gremlin to blur an input randomly selected
function customGremlin(logger, randomizer) {
    // Code executed once at initialization
    logger.log('Input blur gremlin initialized');
    // Return a function that will be executed at each attack
    return function attack() {
        var inputs = document.querySelectorAll('input');
        var element = randomizer.pick(element);
        element.blur();
    };
}

// Add it to your horde
horde.createHorde({
    species: [customGremlin],
});
```

Everything in `gremlins.js` is configurable ; you will find it very easy to extend and adapt to you use cases.

## Installation

In the browser, the `gremlins.min.js` file can be used as a standalone library, and adds `gremlins` to the global namespace:

```html
<script src="path/to/gremlins.min.js"></script>
<script>
    gremlins.createHorde().unleash();
</script>
```

Alternately, you can include `gremlins.min.js` as a module, leaving the global namespace clean:

```js
const gremlins = require('gremlins');
```

Or in ES6 syntax :

```js
import gremlins from 'gremlins';
```

`gremlins.js` is also available as a **bookmarklet**. Go to [this page](https://marmelab.com/gremlins.js/), grab it, and unleash hordes on any web page.

## Advanced Usage

### Setting Gremlins and Mogwais To Use In A Test

By default, all gremlins and mogwais species are added to the horde.

You can also choose to add only the gremlins species you want, using a custom configuration object:

```js
gremlins
    .createHorde({
        species: [
            gremlins.species.formFiller(),
            gremlins.species.clicker({
                clickTypes: ['click'],
            }),
            gremlins.species.toucher(),
        ],
    })
    .unleash();
```

If you just want to add your own gremlins in addition to the default ones, use the `allSpecies` constant:

```js
gremlins
    .createHorde({
        species: [...gremlins.allSpecies, customGremlin],
    })
    .unleash();
```

To add just the mogwais you want, use the `mogwai` configuration and `allMogwais()` constant the same way.

`gremlins.js` currently provides a few gremlins and mogwais:

-   [clickerGremlin](src/species/clicker.js) clicks anywhere on the visible area of the document
-   [toucherGremlin](src/species/toucher.js) touches anywhere on the visible area of the document
-   [formFillerGremlin](src/species/formFiller.js) fills forms by entering data, selecting options, clicking checkboxes, etc
-   [scrollerGremlin](src/species/scroller.js) scrolls the viewport to reveal another part of the document
-   [typerGremlin](src/species/typer.js) types keys on the keyboard
-   [alertMogwai](src/mogwais/alert.js) prevents calls to alert() from blocking the test
-   [fpsMogwai](src/mogwais/fps.js) logs the number of frames per seconds (FPS) of the browser
-   [gizmoMogwai](src/mogwais/gizmo.js) can stop the gremlins when they go too far

### Configuring Gremlins

All the gremlins and mogwais provided by `gremlins.js` are _configurable_, i.e. you can alter the way they work by injecting a custom configuration.

For instance, the clicker gremlin is a function that take an object as custom configuration:

```js
const customClicker = gremlins.species.clicker({
    // which mouse event types will be triggered
    clickTypes: ['click'],
    // Click only if parent is has class test-class
    canClick: element => element.parentElement.className === 'test-class',
    // by default, the clicker gremlin shows its action by a red circle
    // overriding showAction() with an empty function makes the gremlin action invisible
    showAction: (x, y) => {},
});
gremlins.createHorde({
    species: [customClicker],
});
```

Each particular gremlin or mogwai has its own customization methods, check the source for details.

### Seeding The Randomizer

If you want the attack to be repeatable, you need to seed the random number generator :

```js
// seed the randomizer
horde.createHorde({
    randomizer: new gremlins.Chance(1234);
});
```

### Executing Code Before or After The Attack

Before starting the attack, you may want to execute custom code. This is especially useful to:

-   Start a profiler
-   Disable some features to better target the test
-   Bootstrap the application

Fortunately, `unleashHorde` is a Promise. So if you want to execute code before and after the unleash just do:

```js
const horde = gremlins.createHorde();

console.profile('gremlins');
horde.unleash().then(() => {
    console.profileEnd();
});
```

### Setting Up a Strategy

By default, gremlins will attack in random order, in a uniform distribution, separated by a delay of 10ms. This attack strategy is called the [distribution](src/strategies/distribution.js) strategy. You can customize it using the strategies custom object:

```js
const distributionStrategy = gremlins.strategies.distribution({
    distribution: [0.3, 0.3, 0.3, 0.1], // the first three gremlins have more chances to be executed than the last
    delay: 50, // wait 50 ms between each action
});
```

Note that if using default gremlins, there are [five type of gremlins](https://github.com/marmelab/gremlins.js/blob/master/src/index.js#L52). The previous example would give a 0 value to last gremlin specie.

You can also use another strategy. A strategy is just a function expecting one parameter: an array of gremlins. Two other strategies are bundled ([allTogether](src/strategies/allTogether.js) and [bySpecies](src/strategies/bySpecies.js)), and it should be fairly easy to implement a custom strategy for more sophisticated attack scenarios.

### Stopping The Attack

The horde can stop the attack in case of emergency using the `horde.stop()` method Gizmo uses this method to prevent further damages to the application after 10 errors, and you can use it, too, if you don't want the attack to continue.

### Customizing The Logger

By default, gremlins.js logs all gremlin actions and mogwai observations in the console. If you prefer using an alternative logging method (for instance, storing gremlins activity in LocalStorage and sending it in Ajax once every 10 seconds), just provide a logger object with 4 methods (log, info, warn, and error) to the `logger()` method:

```js
const customLogger = {
    log: function(msg) {
        /* .. */
    },
    info: function(msg) {
        /* .. */
    },
    warn: function(msg) {
        /* .. */
    },
    error: function(msg) {
        /* .. */
    },
};
horde.createHorde({ logger: customLogger });
```

## License

gremlins.js is licensed under the [MIT Licence](LICENSE), courtesy of [marmelab](http://marmelab.com).
