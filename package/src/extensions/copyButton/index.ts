import { createTemplate } from "../../core"
import { Extension, PrismEditor } from "../../types"

const template = createTemplate(
		'<button dir="ltr" style="display:none;" class="editor-copy" aria-label="Copy"><svg width="1.2em" viewbox="0 0 48 48" overflow="visible" stroke-width="4" stroke-linecap="round" fill="none" stroke="currentColor"><rect x="16" y="16" width="30" height="30" rx="3"/><path d="M32 9V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v24a3 3 0 0 0 3 3h4"/></svg></button>',
		"display:flex;align-items:flex-start;justify-content:flex-end;",
	),
	clipboard = navigator.clipboard

/**
 * Extension that adds a copy button to the editor.
 * Probably best used with a read-only editor.
 * You must also import styles from `prism-code-editor/copy-button.css`.
 */
export const copyButton = (): Extension => {
	let cEditor: PrismEditor,
		container = <HTMLDivElement>template.cloneNode(true),
		btn = <HTMLButtonElement>container.firstChild!

	btn.addEventListener("click", () => {
		btn.setAttribute("aria-label", "Copied!")
		if (clipboard) clipboard.writeText(cEditor.extensions.codeFold?.fullCode ?? cEditor.value)
		else {
			cEditor.textarea.select()
			document.execCommand("copy")
			cEditor.setSelection(0)
		}
	})

	btn.addEventListener("pointerenter", () => btn.setAttribute("aria-label", "Copy"))

	return {
		update(editor) {
			if (!cEditor) (cEditor = editor).overlays.append(container)
		},
	}
}
