import { languages } from "../core"
import { clikeIndent, isBracketPair } from "./patterns"

languages.clike =
	languages.js =
	languages.javascript =
	languages.ts =
	languages.typescript =
	languages.java =
	languages.cs =
	languages.csharp =
	languages.c =
	languages.cpp =
		{
			comments: {
				line: "//",
				block: ["/*", "*/"],
			},
			autoIndent: [
				([start], value) => clikeIndent.test(value.substring(start - 999, start)),
				([start, end], value) => isBracketPair.test(value[start - 1] + value[end]),
			],
		}
