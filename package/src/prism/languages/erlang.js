import { languages } from '../core.js';
import { boolean } from '../utils/shared.js';

languages.erlang = {
	'comment': /%.+/,
	'string': {
		pattern: /"(?:\\.|[^\\\n"])*"/g,
		greedy: true
	},
	'quoted-function': {
		pattern: /'(?:\\.|[^\\\n'])+'(?=\()/,
		alias: 'function'
	},
	'quoted-atom': {
		pattern: /'(?:\\.|[^\\\n'])+'/,
		alias: 'atom'
	},
	'boolean': boolean,
	'keyword': /\b(?:after|begin|case|catch|end|fun|if|of|receive|try|when)\b/,
	'number': [
		/\$\\?./,
		/\b\d+#[a-z\d]+/i,
		/(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i
	],
	'function': /\b[a-z][\w@]*(?=\()/,
	'variable': {
		// Look-behind is used to prevent wrong highlighting of atoms containing "@"
		pattern: /(^|[^@])(?:\b|\?)[A-Z_][\w@]*/,
		lookbehind: true
	},
	'operator': [
		/[=/<>:]=|=[:/]=|\+\+?|--?|[=*/!]|\b(?:and|andalso|band|bnot|bor|bsl|bsr|bxor|div|not|or|orelse|rem|xor)\b/,
		{
			// We don't want to match <<
			pattern: /(^|[^<])<(?!<)/,
			lookbehind: true
		},
		{
			// We don't want to match >>
			pattern: /(^|[^>])>(?!>)/,
			lookbehind: true
		}
	],
	'atom': /\b[a-z][\w@]*/,
	'punctuation': /[()[\]{}.,:;#|]|<<|>>/

};
