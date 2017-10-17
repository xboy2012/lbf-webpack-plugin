import gulp from 'gulp';
import {rollup} from 'rollup';
import * as babel from 'babel-core';
import {ROOT_DIR} from './utils/consts';
import readFile from './utils/readFile';
import writeFile from './utils/writeFile';

gulp.task('es6', () => {
    return rollup({
        input: `${ROOT_DIR}/src/index.js`,
    }).then((bundle) => {
        return bundle.write({
            format: "es",      // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
            strict: false,   //去除严格模式，减少无用字符，同时增加代码兼容性
            file: `${ROOT_DIR}/dist/index.es6.js`
        });
    });
});

gulp.task('es5', ['es6'], () => {
    return new Promise((resolve, reject) => {
        babel.transformFile(`${ROOT_DIR}/dist/index.es6.js`, {
            //ast: false
            // babelrc: false,
            // presets: ["es2015"],
            // plugins: [
            //     "transform-remove-strict-mode"
            // ]
        }, (err, result) => {
            if(err) {
                reject(err);
            } else {
                resolve(result.code);
            }
        });
    }).then((code) => {
        // 删除如下头部代码，本项目中无用
        // Object.defineProperty(exports, "__esModule", {
        //     value: true
        // });
        // let p = code.indexOf(';');
        // code = code.substring(p+1);
        //
        //将exports.default 改为 module.exports
        code = code.replace('exports.default', 'module.exports');

        return writeFile(`${ROOT_DIR}/dist/index.es5.js`, code);
    })
});

gulp.task('default', ['es6', 'es5']);