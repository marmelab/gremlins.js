module.exports = {
    env: {
        node: true,
        browser: true,
        es2020: true,
    },
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['prettier', 'babel'],
    extends: [
        'eslint:recommended',
        'prettier',
        'plugin:prettier/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
    ],
    rules: {
        'prettier/prettier': 'error',
    },
};
