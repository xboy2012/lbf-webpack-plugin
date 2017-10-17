/**
 * @description   rewrite LibraryTemplatePlugin.Apply()
 */
var LibraryTemplatePlugin = require("webpack/lib/LibraryTemplatePlugin"),

  origin = LibraryTemplatePlugin.prototype.apply,

  lbfTemplatePlugin = require('../lib/lbfTemplatePlugin');


exports.apply = function({name}) {
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
