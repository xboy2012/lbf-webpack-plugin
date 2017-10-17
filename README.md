# lbf-webpack-plugin

将webpack打包生成的文件转换成LBF模块文件。


**安装：**

npm:

```
  npm install lbf-webpack-plugin --save

```


**使用:**

webpack.config.js

```

var LbfWebpackPlugin = require('lbf-webpack-plugin');


module.exports = {

  output: {

    // ..

    libraryTarget: 'amd'

  },

  // 插件
  plugins: [
    new LbfWebpackPlugin({
        name: 'qidian.comp.mymodule'
    })
  ]
}

```
