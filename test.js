MonkeyTest.createSuite()
    .before(function(suite) {
        console.log('started!');
    })
    .monkey(MonkeyTest.crew.ClickMonkey().clickTypes(['click']))
    .monkey(MonkeyTest.crew.ScrollMonkey())
    .monkey(function(suite) {
        console.log('I\'m a monkey!');
    })
    .after(function(suite) {
        console.log('finished!');
    })
    .run(100);
