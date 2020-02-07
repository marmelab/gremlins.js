import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

import pkg from './package.json';

const isProduction = process.env.NODE_ENV === 'production';

const umd = [
    {
        input: 'src/index.js',
        output: {
            name: pkg.name,
            file: pkg.main,
            format: 'umd',
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: /node_modules/,
            }),
            isProduction && terser(),
        ],
    },
];

export default umd;
