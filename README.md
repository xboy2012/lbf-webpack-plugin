# lbf-webpack-plugin

bundle your files into LBF Module format


## Install

npm:

```
  npm install lbf-webpack-plugin --save

```

## Usage

webpack.config.js

```
var LbfWebpackPlugin = require('lbf-webpack-plugin');

module.exports = {

  output: {

    // ..

    libraryTarget: 'amd'

  },

  // plugins
  plugins: [
    new LbfWebpackPlugin({
        name: 'qidian.comp.mymodule'    //the export name you wanna use as the output LBF module name
    })
  ]
}

```
