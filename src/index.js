import LibraryTemplatePlugin_overwrite from './overwrite/LibraryTemplatePlugin';
import isLbfModule from 'is-lbf-module';
import ExternalModule from 'webpack/lib/ExternalModule';
const overwrites = [
    LibraryTemplatePlugin_overwrite
];

class LbfWebpackPlugin {
    constructor({name}){
        this.name = name;
    }
    apply(compiler) {
        let name = this.name;
        // 应用重写
        overwrites.forEach((item)=> {
            item({name});
        });

        compiler.plugin('normal-module-factory', (nmf) => {

            nmf.plugin("resolver", (next) => {
                return (data, callback) => {
                    let req = data.request;
                    if(isLbfModule(req)) {
                        console.warn(`You are using a LBF Module[${req}], consider use commonjs/ES6 instead for better development.`);
                        return callback(null, new ExternalModule(req, 'commonjs'));
                    }
                    return next(data, callback);
                }
            });
        });
    };
}


export default LbfWebpackPlugin;
