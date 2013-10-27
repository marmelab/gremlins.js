Gremlins.createHorde()
    .before(function(done) {
        setTimeout(function(){
            console.log('async');
            done();
        }, 500);
    })
    .before(function() {
        console.log('sync');
    })
    .breed(Gremlins.crew.ClickerGremlin().clickTypes(['click']))
    .breed(Gremlins.crew.ScrollerGremlin())
    .breed(function() {
        console.log('I\'m a gremlin!');
    })
    .after(function() {
        console.log('finished!');
    })
    .unleash(10);
