const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const IconfontPlugin = require('./index.js');

module.exports = {
    context: __dirname,
    entry: {
        index: './demo/index.js'
    },
    output: {
        path: path.resolve(__dirname + '/demo/build'),
        filename: "[name].js"
    },
    plugins: [
        new IconfontPlugin({
            src: './demo/icons/',// dir of svg files.required
            family: 'iconfont-family',// the `font-family`. optional. if multiple iconfonts generated, the dir names will be used.
            dest: {
                font: './demo/fonts/[family].[type]',// paths of generated font files. required.
                css: './demo/scss/_[family].scss'// paths of generated css files. required.
            },
            watch: {
                pattern: './demo/icons/**/*.svg'// watch these files to reload. required.
            }
        }),

        new webpack.NormalModuleReplacementPlugin(/^scss!/, function (data) {
                data.request = data.request.replace(/^scss!/, "!style-loader!css-loader!sass-loader!")
            }
        ),

        new ExtractTextPlugin("styles.css")
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'sass-loader']
                })
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve("./node_modules")
        ],
        extensions: ['.ts','.js']
    },
    node: {
        process: false,
        global: false
    }
};
