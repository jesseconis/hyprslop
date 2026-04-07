import Gio from "gi://Gio"
import GLib from "gi://GLib"

const CACHE_DIR = GLib.build_filenamev([GLib.get_user_cache_dir(), "hyprslop"])
const RECENTS_PATH = GLib.build_filenamev([CACHE_DIR, "emoji-recents.json"])
const RECENT_LIMIT = 16

function getRecentsFile() {
  return Gio.File.new_for_path(RECENTS_PATH)
}

export function readRecentEmojiGlyphs() {
  try {
    const file = getRecentsFile()

    if (!file.query_exists(null)) {
      return []
    }

    const [loaded, contents] = file.load_contents(null)
    if (!loaded) {
      return []
    }

    const parsed = JSON.parse(new TextDecoder().decode(contents)) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, RECENT_LIMIT)
      : []
  } catch {
    return []
  }
}

export function rememberRecentEmojiGlyph(glyph: string) {
  const next = [glyph, ...readRecentEmojiGlyphs().filter((item) => item !== glyph)].slice(0, RECENT_LIMIT)

  try {
    GLib.mkdir_with_parents(CACHE_DIR, 0o755)
    getRecentsFile().replace_contents(
      JSON.stringify(next),
      null,
      false,
      Gio.FileCreateFlags.REPLACE_DESTINATION,
      null,
    )
  } catch (error) {
    console.warn(
      `[hyprslop] failed to persist emoji recents :: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return next
}