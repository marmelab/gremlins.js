// do not export anything else here to keep window.gremlins as a function
export default () => {
    const gremlins = () => {};

    const initHorde = () => {
        gremlins._gremlins = [];
        gremlins._mogwais = [];
        gremlins._strategies = [];
        gremlins._beforeCallbacks = [];
        gremlins._afterCallbacks = [];
        gremlins._logger = console; // logs to console by default
    };

    gremlins.createHorde = () => {
        initHorde();
        return 'New Horde';
    };

    return gremlins;
};
