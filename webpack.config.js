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
            src: './demo/icons/',
            family: 'iconfont-family',
            dest: {
                font: './demo/fonts/[family].[type]',
                css: './demo/scss/_[family].scss'
            },
            watch: {
                pattern: './demo/icons/**/*.svg'
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
            },
            {
                test: /\.(svg|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            outputPath: 'fonts/'
                        }
                    }
                ]
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
