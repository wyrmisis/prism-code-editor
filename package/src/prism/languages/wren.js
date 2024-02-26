import { languages } from '../core.js';
import { boolean, clikePunctuation } from '../utils/shared.js';

// https://wren.io/

languages.wren = {
	// Multiline comments in Wren can have nested multiline comments
	// Comments: // and /* */
	'comment': {
		// support 3 levels of nesting
		// regex: \/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\/
		pattern: /\/\/.*|\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|\/\*(?:[^*/]|\*(?!\/)|\/(?!\*))*\*\/)*\*\/)*\*\//g,
		greedy: true
	},

	// Triple quoted strings are multiline but cannot have interpolation (raw strings)
	// Based on prism-python.js
	'triple-quoted-string': {
		pattern: /"""[\s\S]*?"""/g,
		greedy: true,
		alias: 'string'
	},

	'string-literal': {
		// A single quote string is multiline and can have interpolation (similar to JS backticks ``)
		pattern: /(^|[^\\"])"(?:\\[\s\S]|[^\\"%]|%(?!\()|%\((?:[^()]|\((?:[^()]|\([^)]*\))*\))*\))*"/g,
		lookbehind: true,
		greedy: true,
		inside: {
			'interpolation': {
				// "%(interpolation)"
				pattern: /((?:^|[^\\])(?:\\{2})*)%\((?:[^()]|\((?:[^()]|\([^)]*\))*\))*\)/,
				lookbehind: true,
				inside: {
					'expression': {
						pattern: /^(..)[\s\S]+(?=.)/,
						lookbehind: true,
						inside: 'wren'
					},
					'interpolation-punctuation': {
						pattern: /.+/,
						alias: 'punctuation'
					},
				}
			},
			'string': /[\s\S]+/
		}
	},

	// #!/usr/bin/env wren on the first line
	'hashbang': {
		pattern: /^#!\/.+/g,
		greedy: true,
		alias: 'comment'
	},

	// Attributes are special keywords to add meta data to classes
	'attribute': {
		// #! attributes are stored in class properties
		// #!myvar = true
		// #attributes are not stored and dismissed at compilation
		pattern: /#!?[ \t\u3000]*\w+/,
		alias: 'keyword'
	},
	'class-name': [
		{
			// class definition
			// class Meta {}
			pattern: /(\bclass\s+)\w+/,
			lookbehind: true
		},
		// A class must always start with an uppercase.
		// File.read
		/\b[A-Z][a-z\d_]*\b/,
	],

	// A constant can be a variable, class, property or method. Just named in all uppercase letters
	'constant': /\b[A-Z][A-Z\d_]*\b/,

	'null': {
		pattern: /\bnull\b/,
		alias: 'keyword'
	},
	'keyword': /\b(?:as|break|class|construct|continue|else|for|foreign|if|import|in|is|return|static|super|this|var|while)\b/,
	'boolean': boolean,
	'number': /\b(?:0x[a-f\d]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/i,

	// Functions can be Class.method()
	'function': /\b[a-z_]\w*(?=\s*[({])/i,

	'operator': /<<|>>|[!=<>]=?|&&|\|\||[*/%~^&|?:+-]|\.{2,3}/,
	'punctuation': clikePunctuation
};
