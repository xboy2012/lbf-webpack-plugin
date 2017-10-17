# lbf-webpack-plugin

bundle your files into LBF Module format


## Install

npm:

```
npm install lbf-webpack-plugin --save-dev
```

## Usage

webpack.config.js

```
import LbfWebpackPlugin from 'lbf-webpack-plugin';

export default {
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
