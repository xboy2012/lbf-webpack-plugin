import ExternalModule from 'webpack/lib/ExternalModule';
import OriginalSource from 'webpack-sources/lib/OriginalSource';
import RawSource from 'webpack-sources/lib/RawSource';
import WebpackMissingModule from 'webpack/lib/dependencies/WebpackMissingModule';
import LibraryTemplatePlugin from 'webpack/lib/LibraryTemplatePlugin';
import ConcatSource from 'webpack-sources/lib/ConcatSource';
import isLbfModule from 'is-lbf-module';

/**
 * @description   rewrite ExternalModuleSoucePlugin.Apply()
 */

let origin = ExternalModule.prototype.source;


var ExternalModule$1 = function () {
    ExternalModule.prototype.source = overwrite;
};


/**
 * rewrite
 */
function overwrite() {
    var me = this;

    return me.type === 'amd' ?
        buildLBFExternalModuleSource.call(me) :
        origin.apply(me, arguments);
}


/**
 * export lbf External module source
 */
function buildLBFExternalModuleSource() {
    var me = this,
        code;

    if (me.optional) {
        code = "if(typeof __WEBPACK_EXTERNAL_MODULE_" + me.id + "__ === 'undefined') {" + WebpackMissingModule.moduleCode(request) + "}\n";
    }

    code = "module.exports = __WEBPACK_EXTERNAL_MODULE_" + me.id + "__;";

    return me.useSourceMap ?
        new OriginalSource(code, me.identifier()) :
        new RawSource(code);
}

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
let origin$1 = LibraryTemplatePlugin.prototype.apply;

var LibraryTemplatePlugin$1 = function({name}) {
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
      origin$1.apply(me, arguments);
  };

};

/**
 * @description   采用重写的方法
 *                将webpack打包生成的文件转换成LBF模块文件。
 */


const overwrites = [
    ExternalModule$1,
    LibraryTemplatePlugin$1
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
                        return callback(null, new ExternalModule$1(req, 'commonjs'));
                    }
                    return next(data, callback);
                }
            });
        });

    }
}

export default LbfWebpackPlugin;
