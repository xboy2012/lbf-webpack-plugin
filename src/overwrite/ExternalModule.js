/**
 * @description   rewrite ExternalModuleSoucePlugin.Apply()
 */

import ExternalModule from "webpack/lib/ExternalModule";

import OriginalSource from "webpack-sources/lib/OriginalSource";

import RawSource from "webpack-sources/lib/RawSource";

import WebpackMissingModule from "webpack/lib/dependencies/WebpackMissingModule";

let origin = ExternalModule.prototype.source;


export default function () {
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
