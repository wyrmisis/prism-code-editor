import { languages } from '../core.js';
import { extend, insertBefore } from '../utils/language.js';
import './clike.js';

var interpolationExpr = {
	pattern: /[\s\S]+/
};

var generic = {
	'punctuation': /[<>]/,
	'class-name': /\w+/
};

var v = interpolationExpr.inside = languages.v = extend('clike', {
	'string': {
		pattern: /r?(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*\1/g,
		alias: 'quoted-string',
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\$(?:\{[^{}]*\}|\w+(?:\.\w+(?:\([^\(\)]*\))?|\[[^[\]]+\])*)/,
				lookbehind: true,
				inside: {
					'interpolation-variable': {
						pattern: /^\$\w[\s\S]*$/,
						alias: 'variable'
					},
					'interpolation-punctuation': {
						pattern: /^\$\{|\}$/,
						alias: 'punctuation'
					},
					'interpolation-expression': interpolationExpr
				}
			}
		}
	},
	'class-name': {
		pattern: /(\b(?:enum|interface|struct|type)\s+)(?:C\.)?\w+/,
		lookbehind: true
	},
	'keyword': /(?:\b(?:__global|as|asm|assert|atomic|break|chan|const|continue|defer|else|embed|enum|fn|for|go(?:to)?|if|import|in|interface|is|lock|match|module|mut|none|or|pub|return|rlock|select|shared|sizeof|static|struct|type(?:of)?|union|unsafe)|\$(?:else|for|if)|#(?:flag|include))\b/,
	'number': /\b(?:0x[a-f\d]+(?:_[a-f\d]+)*|0b[01]+(?:_[01]+)*|0o[0-7]+(?:_[0-7]+)*|\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?)\b/i,
	'operator': /~|\?|[*/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.{2,3}/,
	'builtin': /\b(?:any(?:_float|_int)?|bool|byte(?:ptr)?|charptr|f(?:32|64)|i(?:8|16|64|128|nt)|rune|size_t|string|u(?:16|32|64|128)|voidptr)\b/
});

insertBefore(v, 'string', {
	'char': {
		pattern: /`(?:\\`|\\?[^`]{1,2})`/, // using {1,2} instead of `u` flag for compatibility
		alias: 'rune'
	}
});

insertBefore(v, 'operator', {
	'attribute': {
		pattern: /(^[\t ]*)\[(?:deprecated|direct_array_access|flag|inline|live|ref_only|typedef|unsafe_fn|windows_stdcall)\]/m,
		lookbehind: true,
		alias: 'annotation',
		inside: {
			'punctuation': /[[\]]/,
			'keyword': /\w+/
		}
	},
	'generic': {
		pattern: /<\w+>(?=\s*[\)\{])/,
		inside: generic
	}
});

insertBefore(v, 'function', {
	'generic-function': {
		// e.g. foo<T>( ...
		pattern: /\b\w+\s*<\w+>(?=\()/,
		inside: {
			'function': /^\w+/,
			'generic': {
				pattern: /<\w+>/,
				inside: generic
			}
		}
	}
});
