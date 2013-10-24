MonkeyTest.createSuite()
    .before(function(done) {
        setTimeout(function(){
            console.log('async');
            done();
        }, 500);
    })
    .before(function() {
        console.log('sync');
    })
    .monkey(MonkeyTest.crew.ClickMonkey().clickTypes(['click']))
    .monkey(MonkeyTest.crew.ScrollMonkey())
    .monkey(function() {
        console.log('I\'m a monkey!');
    })
    .after(function() {
        console.log('finished!');
    })
    .run(10);
