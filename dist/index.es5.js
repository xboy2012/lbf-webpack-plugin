Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');

var _LibraryTemplatePlugin2 = _interopRequireDefault(_LibraryTemplatePlugin);

var _ConcatSource = require('webpack-sources/lib/ConcatSource');

var _ConcatSource2 = _interopRequireDefault(_ConcatSource);

var _isLbfModule = require('is-lbf-module');

var _isLbfModule2 = _interopRequireDefault(_isLbfModule);

var _ExternalModule = require('webpack/lib/ExternalModule');

var _ExternalModule2 = _interopRequireDefault(_ExternalModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

        if (!externalsDepsArray.length) {
            console.warn('You are not using any LBF modules, consider use standard webpack build and remove this plugin.');
        }

        return new _ConcatSource2.default("LBF.define(", JSON.stringify(name), ', ', JSON.stringify(externalsDepsArray), ", function(require, exports, module){\n", "     module.exports = (function(obj) { return obj && obj.__esModule ? obj.default : obj; })(\n", source, "     );\n", "})");
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
var origin = _LibraryTemplatePlugin2.default.prototype.apply;

var LibraryTemplatePlugin_overwrite = function LibraryTemplatePlugin_overwrite(_ref) {
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
        origin.apply(me, arguments);
    };
};

var overwrites = [LibraryTemplatePlugin_overwrite];

var LbfWebpackPlugin = function () {
    function LbfWebpackPlugin(_ref2) {
        var name = _ref2.name;

        _classCallCheck(this, LbfWebpackPlugin);

        this.name = name;
    }

    _createClass(LbfWebpackPlugin, [{
        key: 'apply',
        value: function apply(compiler) {
            var name = this.name;
            // 应用重写
            overwrites.forEach(function (item) {
                item({ name: name });
            });

            compiler.plugin('normal-module-factory', function (nmf) {

                nmf.plugin("resolver", function (next) {
                    return function (data, callback) {
                        var req = data.request;
                        if ((0, _isLbfModule2.default)(req)) {
                            console.warn('You are using a LBF Module[' + req + '], consider use commonjs/ES6 instead for better development.');
                            return callback(null, new _ExternalModule2.default(req, 'commonjs'));
                        }
                        return next(data, callback);
                    };
                });
            });
        }
    }]);

    return LbfWebpackPlugin;
}();

module.exports = LbfWebpackPlugin;