require.config({
	packages: [
		{ name: 'gremlins', location: '../../src' },
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
	gremlins.createHorde()
		.gremlin(gremlins.species.toucher())
		.mogwai(gremlins.mogwais.gizmo().maxErrors(2))
		.unleash();
});