'use strict';

const TEMPLATE = `
$create-font-face: true !default;

@function iconfont-group($group: null) {
	@if (null == $group) {
		$group: nth(map-keys($__iconfont__data), 1);
	}
	@if (false == map-has-key($__iconfont__data, $group)) {
		@warn 'Undefined Iconfont Family!';
		@return ();
	}
	@return map-get($__iconfont__data, $group);
}

@function iconfont-item($name) {
	$slash: str-index($name, '/');
	$group: null;
	@if ($slash) {
		$group: str-slice($name, 0, $slash - 1);
		$name: str-slice($name, $slash + 1);
	} @else {
		$group: nth(map-keys($__iconfont__data), 1);
	}
	$group: iconfont-group($group);
	@if (false == map-has-key($group, $name)) {
		@warn 'Undefined Iconfont Glyph!';
		@return '';
	}
	@return map-get($group, $name);
}

@mixin iconfont($icon) {
  &:before{
    font-family: "__FAMILY__";
    font-style: normal;
    font-weight: 400;
    content: iconfont-item($icon);
  }
}

@if $create-font-face == true{
	@font-face {
	 font-family: "__FAMILY__";
	 src: url('__RELATIVE_FONT_PATH__/__FAMILY__.eot'); /* IE9 Compat Modes */
	 src: url('__RELATIVE_FONT_PATH__/__FAMILY__.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
		  url('__RELATIVE_FONT_PATH__/__FAMILY__.woff') format('woff'), /* Pretty Modern Browsers */
		  url('__RELATIVE_FONT_PATH__/__FAMILY__.ttf')  format('truetype'), /* Safari, Android, iOS */
		  url('__RELATIVE_FONT_PATH__/__FAMILY__.svg') format('svg'); /* Legacy iOS */
	 
	}
}
`;

function toSCSS(glyphs) {
	return JSON.stringify(glyphs, null, '\t')
		.replace(/\{/g, '(')
		.replace(/\}/g, ')')
		.replace(/\\\\/g, '\\');
}

module.exports = function(args) {
	const family = args.family;
	const pathToFonts = args.fontPath;
	const glyphs = args.unicodes.reduce(function(glyphs, glyph) {
		glyphs[glyph.name] = '\\' + glyph.unicode.charCodeAt(0).toString(16).toLowerCase();
		return glyphs;
	}, {});
	const data = {};
	data[family] = glyphs;

    const replacements = {
        __FAMILY__: family,
        __RELATIVE_FONT_PATH__: pathToFonts,
        goat:"cat"
    };

    const str = TEMPLATE.replace(/__FAMILY__|__RELATIVE_FONT_PATH__|goat/gi, function(matched){
        return replacements[matched];
    });

	return [
		`$__iconfont__data: map-merge(if(global_variable_exists('__iconfont__data'), $__iconfont__data, ()), ${toSCSS(data)});`,
		str
	].join('\n\n');
};