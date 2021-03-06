/**
 * @description   LBF template plugin
 */
import ConcatSource from "webpack-sources/lib/ConcatSource";

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

        externalsDepsArray = [];
        for(let module of externals) {
            //外部全局变量忽略掉
            if(module.type === 'var') {
                continue;
            }
            externalsDepsArray.push(module.request);
        }

        if(!externalsDepsArray.length) {
            console.warn('You are not using any LBF modules, consider use standard webpack build and remove this plugin.');
        }

        return new ConcatSource(
            "LBF.define(", JSON.stringify(name),
            ', ', JSON.stringify(externalsDepsArray),
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


export default lbfTemplatePlugin;
