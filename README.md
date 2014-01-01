# gremlins.js

gremlins.js is a monkey testing library written in JavaScript, for Node.js and the browser. Use it to check the robustness of web applications by unleashing a horde of undisciplined gremlins.


> Kate: *What are they, Billy?*
>
> Billy Peltzer: *They're gremlins, Kate, just like Mr. Futterman said.*

## Basic Usage

A gremlins "horde" is an army of specialized gremlins ready to mess with your application. This library provides several gremlin types: Some gremlins click everywhere on the page, others enter data in form inputs, others scroll the window in every posible direction, etc. You must first create a horde, then "breed" gremlins types to enable them. Then, "unleash" the gremlins to start the stress test.

```js
// create horde
var horde = gremlins.createHorde()
// add all existing gremlin types
horde.breedAll();
// launch the test: every gremlin will act 10 times
horde.unleash(10);
```

## Installation

In the browser, the `gremlins.min.js` file can be used as a standalone library:

```html
<script src="path/to/gremlins.min.js"></script>
<script>
gremlins
  .createHorde()
  .breedAll()
  .unleash();
</script>
```

Alternately, you can include `gremlins.min.js` as a RequireJS module:

```js
require.config({
  paths: { 
	gremlins: 'path/to/gremlins.min'
  }
});

require(['gremlins'], function(gremlins) {
  gremlins
    .createHorde()
    .breedAll()
    .unleash();
});
```
