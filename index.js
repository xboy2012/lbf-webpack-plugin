/**
 * @description   采用重写的方法
 *                将webpack打包生成的文件转换成LBF模块文件。
 */

const overwrites = [

  require('./overwrite/ExternalModule'),

  require('./overwrite/LibraryTemplatePlugin')
];


var lbfWebpackPlugin = function({name}){
    this.name = name;
};


/**
 * 将重写的方法应用到webpack上
 */
lbfWebpackPlugin.prototype.apply = function() {

    var name = this.name;
    // 应用重写
    overwrites.forEach(function (item) {
        item.apply({name});
    });

};


module.exports = lbfWebpackPlugin;
