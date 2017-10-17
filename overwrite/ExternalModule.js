/**
 * @description   rewrite ExternalModuleSoucePlugin.Apply()
 */

var ExternalModule = require("webpack/lib/ExternalModule"),

  OriginalSource = require("webpack-sources/lib/OriginalSource"),

  RawSource = require("webpack-sources/lib/RawSource"),

  WebpackMissingModule = require("webpack/lib/dependencies/WebpackMissingModule"),

  origin = ExternalModule.prototype.source;



exports.apply = function() {
  ExternalModule.prototype.source = overwrite
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
