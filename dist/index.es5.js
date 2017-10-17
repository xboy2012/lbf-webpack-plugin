Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ExternalModule = require('webpack/lib/ExternalModule');

var _ExternalModule2 = _interopRequireDefault(_ExternalModule);

var _OriginalSource = require('webpack-sources/lib/OriginalSource');

var _OriginalSource2 = _interopRequireDefault(_OriginalSource);

var _RawSource = require('webpack-sources/lib/RawSource');

var _RawSource2 = _interopRequireDefault(_RawSource);

var _WebpackMissingModule = require('webpack/lib/dependencies/WebpackMissingModule');

var _WebpackMissingModule2 = _interopRequireDefault(_WebpackMissingModule);

var _LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');

var _LibraryTemplatePlugin2 = _interopRequireDefault(_LibraryTemplatePlugin);

var _ConcatSource = require('webpack-sources/lib/ConcatSource');

var _ConcatSource2 = _interopRequireDefault(_ConcatSource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * @description   rewrite ExternalModuleSoucePlugin.Apply()
 */

var origin = _ExternalModule2.default.prototype.source;

var ExternalModule$1 = function ExternalModule$1() {
    _ExternalModule2.default.prototype.source = overwrite;
};

/**
 * rewrite
 */
function overwrite() {
    var me = this;

    return me.type === 'amd' ? buildLBFExternalModuleSource.call(me) : origin.apply(me, arguments);
}

/**
 * export lbf External module source
 */
function buildLBFExternalModuleSource() {
    var me = this,
        code;

    if (me.optional) {
        code = "if(typeof __WEBPACK_EXTERNAL_MODULE_" + me.id + "__ === 'undefined') {" + _WebpackMissingModule2.default.moduleCode(request) + "}\n";
    }

    code = "module.exports = __WEBPACK_EXTERNAL_MODULE_" + me.id + "__;";

    return me.useSourceMap ? new _OriginalSource2.default(code, me.identifier()) : new _RawSource2.default(code);
}

/**
 * @description   LBF template plugin
 */
var lbfTemplatePlugin = function lbfTemplatePlugin(name) {
    this.name = name;
};

lbfTemplatePlugin.prototype.apply = function (compilation) {
    var name = this.name;

    var mainTemplate = compilation.mainTemplate;

    // bind render-with-entry event
    compilation.templatesPlugin("render-with-entry", function (source, chunk, hash) {
        var externals, externalsDepsArray;

        externals = chunk.getModules().filter(function (module) {
            return module.external;
        });

        // no externals
        if (!externals.length) {
            return new _ConcatSource2.default("LBF.define(", name, ", function(require, exports, module) { module.exports = ", source, "});");
        }

        externalsDepsArray = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = externals[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var module = _step.value;

                //外部全局变量忽略掉
                if (module.type === 'var') {
                    continue;
                }
                externalsDepsArray.push(module.request);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return new (Function.prototype.bind.apply(_ConcatSource2.default, [null].concat(["LBF.define(", JSON.stringify(name), ', [\n     "'], _toConsumableArray(externalsDepsArray.join('",\n     "')), ['"\n]', ", function(require, exports, module){\n", "     module.exports = (function(obj) { return obj && obj.__esModule ? obj.default : obj; })(\n", source, "     );\n", "})"])))();
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
var origin$1 = _LibraryTemplatePlugin2.default.prototype.apply;

var LibraryTemplatePlugin$1 = function LibraryTemplatePlugin$1(_ref) {
    var name = _ref.name;

    _LibraryTemplatePlugin2.default.prototype.apply = function overwrite(compiler) {
        var me = this;

        // TODO:To add amd libraryTarget
        if (me.target === 'amd') {
            compiler.plugin("this-compilation", function (compilation) {
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

var overwrites = [ExternalModule$1, LibraryTemplatePlugin$1];

var LbfWebpackPlugin = function LbfWebpackPlugin(_ref2) {
    var name = _ref2.name;

    this.name = name;
};

/**
 * 将重写的方法应用到webpack上
 */
LbfWebpackPlugin.prototype.apply = function () {

    var name = this.name;
    // 应用重写
    overwrites.forEach(function (item) {
        item({ name: name });
    });
};

module.exports = LbfWebpackPlugin;