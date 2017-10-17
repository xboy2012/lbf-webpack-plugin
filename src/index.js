/**
 * @description   采用重写的方法
 *                将webpack打包生成的文件转换成LBF模块文件。
 */


import ExternalModule from './overwrite/ExternalModule';
import LibraryTemplatePlugin from './overwrite/LibraryTemplatePlugin';

const overwrites = [
    ExternalModule,
    LibraryTemplatePlugin
];

var LbfWebpackPlugin = function({name}){
    this.name = name;
};


/**
 * 将重写的方法应用到webpack上
 */
LbfWebpackPlugin.prototype.apply = function() {

    var name = this.name;
    // 应用重写
    overwrites.forEach(function (item) {
        item({name});
    });
};


export default LbfWebpackPlugin;
