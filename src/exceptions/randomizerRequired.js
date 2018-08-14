export default () => {
    this.message =
        'This gremlin requires a randomizer to run. Please call randomizer(randomizerObject) before executing the gremlin';
    this.toString = function() {
        return this.message;
    };
};
