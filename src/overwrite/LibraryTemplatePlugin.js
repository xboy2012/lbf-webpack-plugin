/**
 * @description   rewrite LibraryTemplatePlugin.Apply()
 */
import LibraryTemplatePlugin from "webpack/lib/LibraryTemplatePlugin";
import LbfTemplatePlugin from '../lib/LbfTemplatePlugin';

let origin = LibraryTemplatePlugin.prototype.apply;

export default function({name}) {
  LibraryTemplatePlugin.prototype.apply = function overwrite(compiler) {
      var me = this;

      // TODO:To add amd libraryTarget
      if (me.target === 'amd') {
          compiler.plugin("this-compilation", function(compilation) {
              compilation.apply(new LbfTemplatePlugin(name));
          });
          return;
      }

      // If not lbf, use origin
      origin.apply(me, arguments);
  };

};
