require.config({
	packages: [
		{ name: 'gremlins', location: '../../src' },
	]
});

require(['gremlins'], function(gremlins) {
	// start!
	gremlins.createHorde()
		.gremlin(gremlins.species.clicker())
		.gremlin(gremlins.species.toucher())
		.mogwai(gremlins.mogwais.gizmo().maxErrors(2))
		.unleash();
});