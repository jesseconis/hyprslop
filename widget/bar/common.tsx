import { execAsync } from "ags/process"
import { Accessor } from "gnim"

const DEBUG_ENABLED = typeof DEBUG !== "undefined" && DEBUG

export type ModuleProps = {
  icon: string
  value: string | Accessor<string>
  className?: string
  tooltipText?: string | Accessor<string>
  onClicked?: () => void
}

export function debugLog(message: string) {
  if (DEBUG_ENABLED) {
    console.log(`[hyprbar] ${message}`)
  }
}

export async function readCommand(argv: string[]) {
  try {
    return await execAsync(argv)
  } catch (error) {
    debugLog(
      `command failed: ${argv.join(" ")} :: ${error instanceof Error ? error.message : String(error)}`,
    )

    return ""
  }
}

export function readMeminfoValue(meminfo: string, key: string) {
  const line = meminfo
    .split("\n")
    .find((entry) => entry.startsWith(`${key}:`))

  if (!line) return 0

  const value = Number.parseInt(line.replace(/\D+/g, " ").trim().split(/\s+/)[0] ?? "0", 10)
  return Number.isFinite(value) ? value : 0
}

export function openNetworkEditor() {
  void execAsync(["nm-connection-editor"]).catch((error) => {
    debugLog(
      `failed to open nm-connection-editor :: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
}

export function Module({ icon, value, className = "", tooltipText, onClicked }: ModuleProps) {
  const classes = ["module", className].filter(Boolean).join(" ")
  const content = (
    <box class="module-content">
      <label class="module-icon" label={icon} />
      <label class="module-value" label={value} />
    </box>
  )

  if (onClicked) {
    return (
      <button class={`${classes} module-button`} tooltipText={tooltipText} onClicked={onClicked}>
        {content}
      </button>
    )
  }

  return (
    <box class={`${classes} module-static`} tooltipText={tooltipText}>
      {content}
    </box>
  )
}