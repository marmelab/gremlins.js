MonkeyTest.createSuite()
    .before(function(suite) {
        console.log('started!');
    })
    //.allMonkeys()
    .monkey(MonkeyTest.crew.ClickMonkey())
    .monkey(MonkeyTest.crew.ScrollMonkey())
    .monkey(function(suite) {
        console.log('I\'m a monkey!');
    })
    .after(function(suite) {
        console.log('finished!');
    })
    .run(100);
