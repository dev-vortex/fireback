// Rollup plugins to install as npm --save-dev
import typescript from '@rollup/plugin-typescript' //used for typescript compilation
import resolve from '@rollup/plugin-node-resolve' //used for enabel NPM modules +
import commonjs from '@rollup/plugin-commonjs' //with probably use commonjs
import replace from '@rollup/plugin-replace' //used for replacing ENV varible in code
import json from '@rollup/plugin-json'
import { uglify } from 'rollup-plugin-uglify' //used for production minification

// Rollup configuration
export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        compact: true,
        preserveModules: true,
        exports: 'auto',
    },
    // We usually need to add all the package dependenciies here
    external: [
        'camelcase',
        'firebase-admin',
        'firebase-functions',
        'get-caller-file',
        'glob',
    ],
    plugins: [
        typescript({
            module: 'esnext',
        }), // default use tsconfig.json but can be ovverride here
        json(),
        resolve(), // used to resolve NPM module reading from packages.json those entrypoint (ES6 - Main or Browser specific)
        commonjs(), // translate commonjs module to ES6 module to be handle from Rollup and tree-shake
        replace({
            // enable find-replacing variable in JS code to use ENV varibale for conditional code
            preventAssignment: false,
            ENV: JSON.stringify(process.env.NODE_ENV || 'development'), // key = var name, value = replace
        }),
        uglify({
            toplevel: false,
            compress: {
                passes: 2,
            },
            mangle: {},
            // mangle: {
            //     toplevel: false,
            //     properties: true,
            // },
        }), // we can also use somethiing like: process.env.NODE_ENV === 'production' && uglify()
    ],
}
