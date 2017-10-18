import LibraryTemplatePlugin from 'webpack/lib/LibraryTemplatePlugin';
import ConcatSource from 'webpack-sources/lib/ConcatSource';
import isLbfModule from 'is-lbf-module';
import ExternalModule from 'webpack/lib/ExternalModule';

/**
 * @description   LBF template plugin
 */
var lbfTemplatePlugin = function(name) {
  this.name = name;
};

lbfTemplatePlugin.prototype.apply = function(compilation) {
    var name = this.name;

    var mainTemplate = compilation.mainTemplate;

    // bind render-with-entry event
    compilation.templatesPlugin("render-with-entry", function(source, chunk, hash) {
        var externals, externalsDepsArray;

        externals = chunk.getModules().filter(function (module) {
            return module.external;
        });

        // no externals
        if (!externals.length) {
            return new ConcatSource(
                "LBF.define(", name,
                ", function(require, exports, module) { module.exports = ",
                source,
                "});"
            );
        }

        externalsDepsArray = [];
        for(let module of externals) {
            //外部全局变量忽略掉
            if(module.type === 'var') {
                continue;
            }
            externalsDepsArray.push(module.request);
        }

        return new ConcatSource(
            "LBF.define(", JSON.stringify(name),
            ', [\n     "', ...externalsDepsArray.join('",\n     "'), '"\n]',
            ", function(require, exports, module){\n",
            "     module.exports = (function(obj) { return obj && obj.__esModule ? obj.default : obj; })(\n",
            source,
            "     );\n",
            "})"
        );
    }.bind(this));

    mainTemplate.plugin("global-hash-paths", function (paths) {
        if (this.name) paths.push(this.name);
        return paths;
    }.bind(this));

    mainTemplate.plugin("hash", function (hash) {
        hash.update("exports cmd");
        hash.update(this.name + "");
    }.bind(this));
};

/**
 * @description   rewrite LibraryTemplatePlugin.Apply()
 */
let origin = LibraryTemplatePlugin.prototype.apply;

var LibraryTemplatePlugin_overwrite = function({name}) {
  LibraryTemplatePlugin.prototype.apply = function overwrite(compiler) {
      var me = this;

      // TODO:To add amd libraryTarget
      if (me.target === 'amd') {
          compiler.plugin("this-compilation", function(compilation) {
              compilation.apply(new lbfTemplatePlugin(name));
          });
          return;
      }

      // If not lbf, use origin
      origin.apply(me, arguments);
  };

};

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
