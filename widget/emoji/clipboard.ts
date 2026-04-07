import { execAsync } from "ags/process"
import { ClipboardWriteMode } from "./types"

async function writeCommand(script: string, value: string) {
  await execAsync(["bash", "-lc", script, "hyprslop", value])
}

export async function writeEmojiToClipboard(value: string, mode: ClipboardWriteMode) {
  if (mode === "append") {
    await writeCommand(
      'current="$(wl-paste -n 2>/dev/null || true)"; { printf "%s%s" "$current" "$1" | wl-copy --trim-newline; } >/dev/null 2>&1 &',
      value,
    )
    return
  }

  await writeCommand('{ printf "%s" "$1" | wl-copy --trim-newline; } >/dev/null 2>&1 &', value)
}