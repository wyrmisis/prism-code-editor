import { Extension, InputSelection, PrismEditor, getLineBefore, isChrome } from ".."
import { createTemplate } from "../core"

/** Postion of the cursor relative to the editors overlays. */
export type CursorPosition = {
	top: number
	bottom: number
	left: number
	right: number
}

export interface Cursor extends Extension {
	/** Gets the cursor position relative to the editor overlays. */
	getPosition(): CursorPosition
	/** Scrolls the cursor into view. */
	scrollIntoView(): void
	/** Schedules the cursor to be scrolled into view after the next selection change. */
	scheduleScroll(): void
}

const scrollToEl = (el: Element) => el.scrollIntoView({ block: "nearest" })

const cursorTemplate = createTemplate(" <span></span> ", "position:absolute;top:0;opacity:0;")

/** Extension which can be used to calculate the position of the cursor and scroll it into view. */
export const cursorPosition = (): Cursor => {
	let shouldScroll = false,
		cEditor: PrismEditor,
		prevBefore = " ",
		prevAfter = " ",
		cursorContainer = <HTMLDivElement>cursorTemplate.cloneNode(true),
		[before, cursor, after] = <[Text, HTMLSpanElement, Text]>(<unknown>cursorContainer.childNodes),
		selectionChange = ([start, end, direction]: InputSelection) => {
			let { value, activeLine } = cEditor,
				position = direction == "backward" ? start : end,
				newBefore = getLineBefore(value, position),
				newAfter = /.*/.exec(value.slice(position))![0]

			if (!newBefore && !newAfter) newAfter = " "
			if (prevBefore != newBefore) before.data = prevBefore = newBefore
			if (prevAfter != newAfter) after.data = prevAfter = newAfter
			if (cursorContainer.parentNode != activeLine) activeLine.prepend(cursorContainer)
			if (shouldScroll != (shouldScroll = false)) scrollIntoView()
		},
		scrollIntoView = () => {
			scrollToEl(cursor)
			isChrome && scrollToEl(cEditor.activeLine)
		}

	return {
		update(editor) {
			if (!cEditor) {
				;(cEditor = editor).addListener("selectionChange", selectionChange)

				editor.textarea.addEventListener("beforeinput", e => {
					if (/history/.test(e.inputType)) shouldScroll = true
				})

				if (editor.activeLine) selectionChange(editor.getSelection())
			}
		},
		getPosition() {
			const rect1 = cursor.getBoundingClientRect(),
				rect2 = cEditor.overlays.getBoundingClientRect()

			return {
				top: rect1.y - rect2.y,
				bottom: rect2.bottom - rect1.bottom,
				left: rect1.x - rect2.x,
				right: rect2.right - rect1.x,
			}
		},
		scrollIntoView,
		scheduleScroll() {
			shouldScroll = true
		},
	}
}
