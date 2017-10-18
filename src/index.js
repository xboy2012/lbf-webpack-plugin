/**
 * @description   采用重写的方法
 *                将webpack打包生成的文件转换成LBF模块文件。
 */


import ExternalModule from './overwrite/ExternalModule';
import LibraryTemplatePlugin from './overwrite/LibraryTemplatePlugin';

import isLbfModule from 'is-lbf-module';

const overwrites = [
    ExternalModule,
    LibraryTemplatePlugin
];

class LbfWebpackPlugin {
    constructor(name) {
        this.name = name;
    }
    apply(compiler) {
        let name = this.name;
        // 应用重写
        overwrites.forEach((item) => {
            item({name});
        });

        compiler.plugin('normal-module-factory', function(nmf) {

            nmf.plugin("resolver", function (next) {
                return function (data, callback) {
                    let req = data.request;
                    if(isLbfModule(req)) {
                        return callback(null, new ExternalModule(req, 'commonjs'));
                    }
                    return next(data, callback);
                }
            });
        });

    }
}

export default LbfWebpackPlugin;
