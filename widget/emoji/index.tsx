import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import { For, createComputed, createEffect, createState, onCleanup } from "gnim"
import Pango from "gi://Pango"
import GLib from "gi://GLib"
import Gtk from "gi://Gtk"
import PopupHeader from "../common/PopupHeader"
import PopupSearchField from "../common/PopupSearchField"
import PopupSurface from "../common/PopupSurface"
import PopupWindow from "../common/PopupWindow"
import { writeEmojiToClipboard } from "./clipboard"
import { EMOJI_ENTRIES } from "./data"
import { debugLog, perfLog } from "./debug"
import { filterEmojiEntries, groupEmojiEntries, pickFocusedEntry } from "./model"
import { readRecentEmojiGlyphs, rememberRecentEmojiGlyph } from "./recents"
import { ClipboardWriteMode, EmojiEntry, EmojiGroup } from "./types"

const GRID_COLUMNS = 10
const INITIAL_RENDER_LIMIT = 180
const RENDER_INCREMENT = 120
const SEARCH_DEBOUNCE_MS = 70
const LOAD_MORE_THRESHOLD_PX = 240

function findRecentEntries(glyphs: string[]) {
  return glyphs
    .map((glyph) => EMOJI_ENTRIES.find((entry) => entry.glyph === glyph) ?? null)
    .filter((entry): entry is EmojiEntry => entry !== null)
}

function chunkEntries(entries: EmojiEntry[], size: number) {
  const rows: EmojiEntry[][] = []

  for (let index = 0; index < entries.length; index += size) {
    rows.push(entries.slice(index, index + size))
  }

  return rows
}

export default function EmojiPicker(gdkmonitor: Gdk.Monitor) {
  let searchEntryRef: Gtk.Entry | null = null
  const [open, setOpen] = createState(true)
  const [query, setQuery] = createState("")
  const [appliedQuery, setAppliedQuery] = createState("")
  const [focusIndex, setFocusIndex] = createState(0)
  const [recentGlyphs, setRecentGlyphs] = createState(readRecentEmojiGlyphs())
  const [searchFocused, setSearchFocused] = createState(false)
  const [visibleCount, setVisibleCount] = createState(INITIAL_RENDER_LIMIT)
  const [isActivating, setIsActivating] = createState(false)

  const filteredEntries = createComputed(() => filterEmojiEntries(EMOJI_ENTRIES, appliedQuery()))
  const displayedEntries = createComputed(() => filteredEntries().slice(0, visibleCount()))
  const groupedEntries = createComputed(() => groupEmojiEntries(displayedEntries()))
  const filteredRows = createComputed(() => chunkEntries(displayedEntries(), GRID_COLUMNS))
  const recentEntries = createComputed(() => findRecentEntries(recentGlyphs()))
  const recentRows = createComputed(() => chunkEntries(recentEntries(), GRID_COLUMNS))
  const focusedEntry = createComputed(() => pickFocusedEntry(displayedEntries(), focusIndex()))
  const showGroupedResults = createComputed(() => appliedQuery().trim().length > 0)
  const hasMoreResults = createComputed(() => displayedEntries().length < filteredEntries().length)

  createEffect(() => {
    const nextQuery = query()
    debugLog(`queue query apply raw="${nextQuery}"`)
    const timeoutId = setTimeout(() => {
      debugLog(`apply query raw="${nextQuery}"`)
      setAppliedQuery(nextQuery)
    }, SEARCH_DEBOUNCE_MS)

    onCleanup(() => {
      clearTimeout(timeoutId)
    })
  })

  createEffect(() => {
    appliedQuery()
    setVisibleCount(INITIAL_RENDER_LIMIT)
    setFocusIndex(0)
  })

  createEffect(() => {
    const total = displayedEntries().length

    if (total === 0) {
      if (focusIndex() !== 0) {
        setFocusIndex(0)
      }
      return
    }

    if (focusIndex() >= total) {
      setFocusIndex(total - 1)
    }
  })

  async function activateEntry(entry: EmojiEntry | null, mode: ClipboardWriteMode) {
    debugLog(`activate requested glyph=${entry?.glyph ?? "<none>"} name="${entry?.name ?? "<none>"}" mode=${mode}`)

    if (!entry || isActivating()) {
      if (isActivating()) {
        debugLog("activate ignored because a clipboard operation is already in flight")
      }
      return
    }

    try {
      setIsActivating(true)
      await writeEmojiToClipboard(entry.glyph, mode)
      debugLog(`activate succeeded glyph=${entry.glyph} mode=${mode}`)
      setRecentGlyphs(rememberRecentEmojiGlyph(entry.glyph))
      setOpen(false)
      app.quit()
    } catch (error) {
      console.warn(
        `[hyprslop] failed to write emoji to clipboard :: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setIsActivating(false)
    }
  }

  function loadMoreEntries() {
    setVisibleCount((current) => Math.min(filteredEntries().length, current + RENDER_INCREMENT))
  }

  function maybeLoadMoreFromAdjustment(adjustment: Gtk.Adjustment | null) {
    if (!adjustment || !hasMoreResults()) {
      return
    }

    const remaining = adjustment.get_upper() - (adjustment.get_value() + adjustment.get_page_size())
    if (remaining <= LOAD_MORE_THRESHOLD_PX) {
      loadMoreEntries()
    }
  }

  const setupWindow = (window: Astal.Window) => {
    perfLog("window-setup", `visible=${window.visible}`)
    window.connect("notify::visible", () => {
      debugLog(`window visible changed visible=${window.visible}`)
      if (window.visible) {
        perfLog("window-visible")
      }
    })

    const keyController = Gtk.EventControllerKey.new()
    keyController.set_propagation_phase(Gtk.PropagationPhase.BUBBLE)
    keyController.connect("key-pressed", (_controller, keyval, _keycode, state) => {
      const length = displayedEntries().length
      const focused = focusedEntry()
      const append = Boolean(state & Gdk.ModifierType.SHIFT_MASK)
      const focusedWidget = window.get_focus()
      const searchHasActualFocus = Boolean(
        searchEntryRef && focusedWidget && (focusedWidget === searchEntryRef || focusedWidget.is_ancestor(searchEntryRef) || searchEntryRef.is_ancestor(focusedWidget)),
      )

      debugLog(
        `key pressed keyval=${keyval} searchFocusedState=${searchFocused()} searchFocusedActual=${searchHasActualFocus} focusedWidget=${focusedWidget?.get_name() ?? "<none>"} query="${query()}" appliedQuery="${appliedQuery()}" focusIndex=${focusIndex()} selected=${focused?.glyph ?? "<none>"}`,
      )

      if (searchHasActualFocus && keyval !== Gdk.KEY_Escape) {
        debugLog(`allowing focused search entry to handle keyval=${keyval}`)
        return false
      }

      switch (keyval) {
        case Gdk.KEY_Escape:
          setOpen(false)
          app.quit()
          return true
        case Gdk.KEY_Return:
        case Gdk.KEY_KP_Enter:
          debugLog(`window-level enter handler selected=${focused?.glyph ?? "<none>"}`)
          void activateEntry(focused, append ? "append" : "replace")
          return true
        case Gdk.KEY_Right:
        case Gdk.KEY_l:
        case Gdk.KEY_L:
          if (length > 0) {
            setFocusIndex((focusIndex() + 1) % length)
          }
          return true
        case Gdk.KEY_Left:
        case Gdk.KEY_h:
        case Gdk.KEY_H:
          if (length > 0) {
            setFocusIndex((focusIndex() + length - 1) % length)
          }
          return true
        case Gdk.KEY_Down:
        case Gdk.KEY_j:
        case Gdk.KEY_J:
          if (length > 0) {
            if (focusIndex() >= Math.max(0, length - GRID_COLUMNS) && hasMoreResults()) {
              loadMoreEntries()
            }
            setFocusIndex(Math.min(focusIndex() + GRID_COLUMNS, length - 1))
          }
          return true
        case Gdk.KEY_Up:
        case Gdk.KEY_k:
        case Gdk.KEY_K:
          if (length > 0) {
            setFocusIndex(Math.max(focusIndex() - GRID_COLUMNS, 0))
          }
          return true
        default:
          return false
      }
    })
    window.add_controller(keyController)
  }

  const renderEntryButton = (entry: EmojiEntry) => (
    <button
      class={createComputed(() =>
        focusedEntry()?.glyph === entry.glyph ? "emoji-chip emoji-chip-focused" : "emoji-chip"
      )}
      tooltipText={`${entry.name} • ${entry.group}`}
      valign={Gtk.Align.START}
      onClicked={() => {
        void activateEntry(entry, "replace")
      }}
    >
      <box class="emoji-chip-copy" orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START}>
        <label class="emoji-chip-glyph" label={entry.glyph} />
        <label
          class="emoji-chip-name"
          label={entry.name}
          wrap={false}
          ellipsize={Pango.EllipsizeMode.END}
          maxWidthChars={12}
        />
      </box>
    </button>
  )

  const renderGroupedSection = (group: EmojiGroup) => (
    <box class="emoji-section" orientation={Gtk.Orientation.VERTICAL}>
      <label class="emoji-section-title" xalign={0} label={group.name} />
      <box class="emoji-grid" orientation={Gtk.Orientation.VERTICAL}>
        {chunkEntries(group.entries, GRID_COLUMNS).map((row) => (
          <box class="emoji-grid-row">
            {row.map(renderEntryButton)}
          </box>
        ))}
      </box>
    </box>
  )

  return (
    <PopupWindow
      name="emoji-picker"
      windowClass="EmojiPicker"
      namespace="emoji-picker"
      gdkmonitor={gdkmonitor}
      visible={open}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      exclusivity={Astal.Exclusivity.IGNORE}
      setupWindow={setupWindow}
    >
      <box class="popup-backdrop" hexpand vexpand>
        <PopupSurface className="emoji-picker-surface" width={920} height={680}>
          {/* <PopupHeader title="Emoji Picker" subtitle="Enter copies, Shift+Enter appends, Esc closes" /> */}
          <PopupSearchField
            query={query}
            setQuery={setQuery}
            placeholderText="Search emojis, groups, or aliases"
            focusOnOpen={open}
            onActivate={() => {
              void activateEntry(focusedEntry(), "replace")
            }}
            onFocusChange={(focused) => {
              debugLog(`search focus callback focused=${focused}`)
              setSearchFocused(focused)
            }}
            onReady={(entry) => {
              searchEntryRef = entry
              debugLog(`search entry ready widgetName=${entry.get_name()}`)
            }}
          />

          <box class="emoji-meta-row">
            <label
              class="emoji-results-count"
              xalign={0}
              label={createComputed(() => {
                const total = filteredEntries().length
                const visible = displayedEntries().length
                const scope = showGroupedResults()
                  ? `${total} matches across ${groupedEntries().length} groups`
                  : `${total} emojis`

                if (visible < total) {
                  return `Showing ${visible} of ${scope}`
                }

                return scope
              })}
            />
          </box>

          <box class="emoji-picker-content" orientation={Gtk.Orientation.VERTICAL}>
            <box
              class="emoji-section"
              orientation={Gtk.Orientation.VERTICAL}
              visible={createComputed(() => !showGroupedResults() && recentEntries().length > 0)}
            >
              <label class="emoji-section-title" xalign={0} label="Recent" />
              <box class="emoji-grid" orientation={Gtk.Orientation.VERTICAL}>
                <For each={recentRows}>
                  {(row) => (
                    <box class="emoji-grid-row">
                      {row.map(renderEntryButton)}
                    </box>
                  )}
                </For>
              </box>
            </box>

            <scrolledwindow
              class="emoji-scroll"
              hexpand
              vexpand
              $={(ref: Gtk.ScrolledWindow) => {
                const adjustment = ref.get_vadjustment()
                const handler = adjustment.connect("value-changed", () => {
                  maybeLoadMoreFromAdjustment(adjustment)
                })

                let idleId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
                  maybeLoadMoreFromAdjustment(adjustment)
                  idleId = 0
                  return GLib.SOURCE_REMOVE
                })

                onCleanup(() => {
                  adjustment.disconnect(handler)
                  if (idleId > 0) {
                    GLib.source_remove(idleId)
                  }
                })
              }}
            >
              <box class="emoji-sections" orientation={Gtk.Orientation.VERTICAL}>
                <box class="emoji-section" orientation={Gtk.Orientation.VERTICAL} visible={createComputed(() => !showGroupedResults() && filteredEntries().length > 0)}>
                  <label class="emoji-section-title" xalign={0} label="All Emoji" />
                  <box class="emoji-grid" orientation={Gtk.Orientation.VERTICAL}>
                    <For each={filteredRows}>
                      {(row) => (
                        <box class="emoji-grid-row">
                          {row.map(renderEntryButton)}
                        </box>
                      )}
                    </For>
                  </box>
                </box>

                <box class="emoji-section" orientation={Gtk.Orientation.VERTICAL} visible={createComputed(() => showGroupedResults() && filteredEntries().length > 0)}>
                  <For each={groupedEntries}>
                    {renderGroupedSection}
                  </For>
                </box>

                <box class="emoji-empty-state" orientation={Gtk.Orientation.VERTICAL} visible={createComputed(() => filteredEntries().length === 0)}>
                  <label class="emoji-empty-title" label="No matches" />
                  <label class="emoji-empty-copy" label="Try another name, alias, or emoji glyph." />
                </box>

                <box class="emoji-load-more" orientation={Gtk.Orientation.VERTICAL} visible={hasMoreResults}>
                  <label class="emoji-load-more-copy" label="Scroll to load more" />
                </box>
              </box>
            </scrolledwindow>
          </box>
        </PopupSurface>
      </box>
    </PopupWindow>
  )
}