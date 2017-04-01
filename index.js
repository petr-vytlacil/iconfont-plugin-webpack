'use strict';

const Base = require('run-plugin-webpack');
const svgiconsToSvgfont = require('svgicons2svgfont');
const Font = require('fonteditor-core').Font;
const fs = require('fs');
const path = require('path');
const svgToTtf = require('svg2ttf');

const Plugin = Base.extends(function(options) {
	this.options = this.getOptions(options);
});

Plugin.prototype.getOptions = function(options) {
	const opts = Object(options);
	if(!opts.src || 'string' !== typeof opts.src) {
		throw new TypeError('`src` is invalid!');
	}
	if(!opts.dest || 'string' !== typeof opts.dest.font || 'string' !== typeof opts.dest.css) {
		throw new TypeError('`dest` is invalid!');
	}
	const src = path.resolve(opts.src);
	const dest = {
		font: path.resolve(opts.dest.font),
		css: path.resolve(opts.dest.css)
	};
	const cssTemplate = ('function' === typeof opts.cssTemplate
		? opts.cssTemplate
		: require('./template')
	);
	return {
		src: src,
		dest: {
			font: dest.font,
			css: dest.css,
		},
		cssTemplate: cssTemplate,
		family: ('string' === typeof opts.family && opts.family) || 'iconfont'
	};
};

Plugin.prototype.main = function() {
	const src = this.options.src;
	const readdir = fs.readdirSync(src);
	const useMultipleGroups = readdir.some(function(file) {
		return fs.lstatSync(path.join(src, file)).isDirectory();
	});
	const context = this;
	const promises = (useMultipleGroups
		? readdir.map(function(dir) {
			const dirPath = path.join(src, dir);
			const files = fs.readdirSync(dirPath).map(function(file) {
				return path.resolve(dirPath, file);
			});
			return context.generateFonts(dir, files);
		})
		: [ this.generateFonts(this.options.family, readdir.map(function(file) {
			return path.resolve(src, file);
		})) ]
	);
	return Promise.all(promises);
};

Plugin.prototype.generateFonts = function(family, files) {
	const context = this;
	return new Promise(function(resolve, reject) {
		const buffer = [];
		const unicodes = [];
		const fileStream = svgiconsToSvgfont({
			fontName: family,
			prependUnicode: true,
			log: Function.prototype
		}).on('data', function(data) {
			return buffer.push(data);
		}).on('end', function() {
			return resolve({
				contents: Buffer.concat(buffer).toString(),
				unicodes: unicodes
			});
		}).on('error', function(err) {
			return reject(err);
		});
		let startUnicode = 0xEA01;
		files.forEach(function(file) {
			const glyph = fs.createReadStream(file);
			const unicode = String.fromCharCode(startUnicode++);
			const name = path.parse(file).name;
			unicodes.push({ name: name, unicode: unicode });
			glyph.metadata = {
				name: name,
				unicode: [ unicode ]
			};
			fileStream.write(glyph);
		});
		fileStream.end();
	}).then(function(args) {
		const ttf = new Buffer(svgToTtf(args.contents.toString()).buffer);
		const fontCreator = Font.create(ttf, {
			type: 'ttf',
			hinting: true,
			compound2simple: true,
			inflate: null,
			combinePath: true
		});
		['ttf', 'svg', 'woff', 'eot'].forEach(function(type) {
			const buffer = fontCreator.write({
				type: type,
				hinting: true,
				deflate: null
			});
			const filePath = context.options.dest.font
				.replace(/\[family\]/g, family)
				.replace(/\[type\]/g, type);
			context.addFile(filePath, buffer);
		});
		return args.unicodes;
	}).then(function(unicodes) {
		return Promise.resolve(context.options.cssTemplate({
			unicodes: unicodes,
			family: family
		}))
		.then(function(cssContent) {
			const cssPath = context.options.dest.css.replace(/\[family\]/g, family);
			context.addFile(cssPath, cssContent);
		});
	}).catch(console.dir);
}

module.exports = Plugin;