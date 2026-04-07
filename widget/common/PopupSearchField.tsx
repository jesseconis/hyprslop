import Gtk from "gi://Gtk"
import { Accessor, Setter, createEffect } from "gnim"
import { debugLog, perfLog } from "../emoji/debug"

export interface PopupSearchFieldProps {
  query: Accessor<string>
  setQuery: Setter<string>
  placeholderText?: string
  focusOnOpen?: Accessor<boolean> | boolean
  onActivate?: () => void
  onFocusChange?: (focused: boolean) => void
  onReady?: (entry: Gtk.Entry) => void
}

export default function PopupSearchField({
  query,
  setQuery,
  placeholderText = "Search",
  focusOnOpen = false,
  onActivate,
  onFocusChange,
  onReady,
}: PopupSearchFieldProps) {
  let entryRef: Gtk.Entry | null = null
  let previousOpenState = false

  createEffect(() => {
    const isOpen = typeof focusOnOpen === "function" ? focusOnOpen() : focusOnOpen

    if (isOpen && !previousOpenState && entryRef) {
      if (entryRef.get_text() !== query()) {
        entryRef.set_text(query())
      }
      entryRef.grab_focus()
      entryRef.set_position(-1)
      debugLog(`search entry grabbed focus text="${entryRef.get_text()}" hasFocus=${entryRef.has_focus}`)
      perfLog("search-focus-requested")
    }

    previousOpenState = isOpen
  })

  return (
    <entry
      class="popup-search"
      hexpand
      placeholderText={placeholderText}
      text={query}
      $={(ref: Gtk.Entry) => {
        entryRef = ref
        onReady?.(ref)
        perfLog("search-ready", `widget=${ref.get_name()}`)
        ref.connect("changed", () => {
          debugLog(`search changed text="${ref.get_text()}" hasFocus=${ref.has_focus}`)
          setQuery(ref.get_text())
        })
        if (onFocusChange) {
          onFocusChange(ref.has_focus)
          ref.connect("notify::has-focus", () => {
            debugLog(`search focus changed hasFocus=${ref.has_focus} text="${ref.get_text()}"`)
            if (ref.has_focus) {
              perfLog("search-focused")
            }
            onFocusChange(ref.has_focus)
          })
        }
        if (onActivate) {
          ref.connect("activate", () => {
            debugLog(`search activate text="${ref.get_text()}" hasFocus=${ref.has_focus}`)
            onActivate()
          })
        }
      }}
    />
  )
}