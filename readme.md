TO DO.

An Example:

	const IconfontPlugin = require('iconfont-plugin-webpack');

	new IconfontPlugin({
		src: './src/asset/iconfont',// dir of svg files.required
		family: 'iconfont',// the `font-family`. optional. if multiple iconfonts generated, the dir names will be used.
		dest: {
			font: './src/font/[family].[type]',// paths of generated font files. required.
			css: './src/css/_iconfont_[family].scss'// paths of generated css files. required.
		},
		watch: {
			pattern: 'src/asset/iconfont/**/*.svg',// watch these files to reload. required.
			cwd: undefined// current working dir for watching. optional.
		},
		cssTemplate: function() {}// the function to generate css contents. optional.
	})