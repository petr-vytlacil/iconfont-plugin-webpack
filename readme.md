# iconfont-plugin-webpack

### Automatically generate Webfonts from your SVGs using Webpack

#### Installation

`npm install iconfont-plugin-webpack`


#### Usage

You can see a simple example within the [Demo Config](webpack.config.js), but basically you just need to include the package at the top of your webpack config like this:

`const IconfontPlugin = require('iconfont-plugin-webpack');`

And then set up the configuration within the `webpackModule.plugins` like this:

```js
new IconfontPlugin({
    src: './src/asset/iconfont', // required - directory where your .svg files are located
    family: 'iconfont', // optional - the `font-family` name. if multiple iconfonts are generated, the dir names will be used.
    dest: {
        font: './src/font/[family].[type]', // required - paths of generated font files
        css: './src/css/_iconfont_[family].scss' // required - paths of generated css files
    },
    watch: {
        pattern: 'src/asset/iconfont/**/*.svg', // required - watch these files to reload
        cwd: undefined // optional - current working dir for watching
    },
    cssTemplate: function() {}// optional - the function to generate css contents
})
```
