import GLib from "gi://GLib"

export const DEBUG_ENABLED = typeof DEBUG !== "undefined" && DEBUG
const START_US = GLib.get_monotonic_time()

export function debugLog(message: string) {
  if (DEBUG_ENABLED) {
    console.log(`[emoji-picker] ${message}`)
  }
}

export function perfLog(stage: string, details?: string) {
  if (!DEBUG_ENABLED) {
    return
  }

  const elapsedMs = ((GLib.get_monotonic_time() - START_US) / 1000).toFixed(2)
  const suffix = details ? ` ${details}` : ""
  console.log(`[emoji-picker:perf] stage=${stage} elapsed_ms=${elapsedMs}${suffix}`)
}