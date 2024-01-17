import { languages } from '../core.js';
import { clone, insertBefore } from '../utils/language.js';
import './markup.js';
import './csharp.js';

var commentLike = /\/(?![/*])|\/\/.*\n|\/\*[^*]*(?:\*(?!\/)[^*]*)*\*\//.source;
var stringLike =
	`@(?!")|"(?:[^\\n\\\\"]|\\\\.)*"|@"(?:[^\\\\"]|""|\\\\[\\s\\S])*"(?!")|'(?:(?:[^\\n'\\\\]|\\\\.|\\\\[Uux][\\da-fA-F]{1,8})'|(?=[^\\\\](?!')))`;

/**
 * Creates a nested pattern where all occurrences of the string `<<self>>` are replaced with the pattern itself.
 *
 * @param {string} pattern
 * @param {number} depthLog2
 * @returns {string}
 */
var nested = (pattern, depthLog2) => {
	for (var i = 0; i < depthLog2; i++) {
		pattern = pattern.replace(/<self>/g, () => '(?:' + pattern + ')');
	}
	return pattern
		.replace(/<self>/g, '[^\\s\\S]')
		.replace(/<str>/g, `(?:${stringLike})`)
		.replace(/<comment>/g, `(?:${commentLike})`);
}

var round = nested(/\((?:[^()'"@/]|<str>|<comment>|<self>)*\)/.source, 2);
var square = nested(/\[(?:[^\[\]'"@/]|<str>|<comment>|<self>)*\]/.source, 1);
var curly = nested(/\{(?:[^{}'"@/]|<str>|<comment>|<self>)*\}/.source, 2);
var angle = nested(/<(?:[^<>'"@/]|<comment>|<self>)*>/.source, 1);

var inlineCs = `@(?:await\\b\\s*)?(?:(?!await\\b)\\w+\\b|${round})(?:[?!]?\\.\\w+\\b|(?:${angle})?${round}|${square})*(?![?!\\.(\\[]|<(?!\\/))`;

// Note about the above bracket patterns:
// They all ignore HTML expressions that might be in the C# code. This is a problem because HTML (like strings and
// comments) is parsed differently. This is a huge problem because HTML might contain brackets and quotes which
// messes up the bracket and string counting implemented by the above patterns.
//
// This problem is not fixable because 1) HTML expression are highly context sensitive and very difficult to detect
// and 2) they require one capturing group at every nested level. See the `tagRegion` pattern to admire the
// complexity of an HTML expression.
//
// To somewhat alleviate the problem a bit, the patterns for characters (e.g. 'a') is very permissive, it also
// allows invalid characters to support HTML expressions like this: <p>That's it!</p>.

var tagAttrInlineCs = "@(?![\\w()])|" + inlineCs;
var tagAttrValue = `(?:"[^"@]*"|'[^'@]*'|[^\\s'"@>=]+(?=[\\s>])|["'][^"'@]*(?:(?:${tagAttrInlineCs})[^"\'@]*)+["\'])`;

var tagAttrs = `(?:\\s(?:\\s*[^\\s>\\/=]+(?:\\s*=\\s*${tagAttrValue}|(?=[\\s/>])))+)?`;
var tagContent = `(?!\\d)[^\\s>\\/=$<%]+${tagAttrs}\\s*\\/?>`;
var tagRegion = `\\B@?(?:<([a-zA-Z][\\w:]*)${tagAttrs}\\s*>(?:[^<]|<\\/?(?!\\1\\b)${tagContent}|${nested(
	`<\\1${tagAttrs}\\s*>(?:[^<]|<\\/?(?!\\1\\b)${tagContent}|<self>)*<\\/\\1\\s*>`, 2
)})*<\\/\\1\\s*>|<${tagContent})`

// Now for the actual language definition(s):
//
// Razor as a language has 2 parts:
//  1) CSHTML: A markup-like language that has been extended with inline C# code expressions and blocks.
//  2) C#+HTML: A variant of C# that can contain CSHTML tags as expressions.
//
// In the below code, both CSHTML and C#+HTML will be create as separate language definitions that reference each
// other. However, only CSHTML will be exported via `languages`.

var cshtml = languages.razor = languages.cshtml = clone(languages.html);

var csharpWithHtml = clone(languages.cs);

var cs = {
	pattern: /\S[\s\S]*/,
	alias: 'language-csharp',
	inside: csharpWithHtml
};

var inlineValue = {
	pattern: RegExp(/(^|[^@])/.source + inlineCs),
	lookbehind: true,
	greedy: true,
	alias: 'variable',
	inside: {
		'keyword': /^@/,
		'csharp': cs
	}
};

var attrValue = cshtml.tag.inside['attr-value'][2];
// var brackets = cshtml['markup-bracket'];

// delete cshtml['markup-bracket'];
// cshtml['markup-bracket'] = brackets;
cshtml.tag.pattern = RegExp(/<\/?/.source + tagContent);
attrValue.pattern = RegExp(/(=\s*)/.source + tagAttrValue);

insertBefore(csharpWithHtml, 'string', {
	'html': {
		pattern: RegExp(tagRegion),
		greedy: true,
		inside: cshtml
	}
});

insertBefore(attrValue.inside, 'punctuation', { 'value': inlineValue });

insertBefore(cshtml, 'prolog', {
	'razor-comment': {
		pattern: /@\*[\s\S]*?\*@/,
		greedy: true,
		alias: 'comment'
	},

	'block': {
		pattern: RegExp(
			`(^|[^@])@(?:${curly}|(?:code|functions)\\s*${curly}|(?:for|foreach|lock|switch|using|while)\\s*${
				round
			}\\s*${curly}|do\\s*${curly}\\s*while\\s*${round}(?:\\s*;)?|try\\s*${curly}\\s*catch\\s*${round}\\s*${curly}\\s*finally\\s*${
				curly
			}|if\\s*${round}\\s*${curly}(?:\\s*else(?:\\s+if\\s*${round})?\\s*${curly})*|helper\\s+\\w+\\s*${round}\\s*${curly})`
		),
		lookbehind: true,
		greedy: true,
		inside: {
			'keyword': /^@\w*/,
			'csharp': cs
		}
	},

	'directive': {
		pattern: /^([ \t]*)@(?:addTagHelper|attribute|implements|inherits|inject|layout|model|namespace|page|preservewhitespace|removeTagHelper|section|tagHelperPrefix|using)(?=\s).*/m,
		lookbehind: true,
		greedy: true,
		inside: {
			'keyword': /^@\w+/,
			'csharp': cs
		}
	},

	'value': inlineValue,

	'delegate-operator': {
		pattern: /(^|[^@])@(?=<)/,
		lookbehind: true,
		alias: 'operator'
	}
});
