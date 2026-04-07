import app from "ags/gtk4/app"
import { Gdk } from "ags/gtk4"
import { execAsync } from "ags/process"

type HyprMonitor = {
  name?: string
  focused?: boolean
}

export async function getFocusedMonitor() {
  const monitors = app.get_monitors()

  if (monitors.length === 0) {
    return null
  }

  try {
    const output = await execAsync(["hyprctl", "monitors", "-j"])
    const parsed = JSON.parse(output) as HyprMonitor[]
    const focusedName = parsed.find((monitor) => monitor.focused)?.name

    if (!focusedName) {
      return monitors[0] ?? null
    }

    return monitors.find((monitor) => monitor.connector === focusedName) ?? monitors[0] ?? null
  } catch (error) {
    console.warn(
      `[hyprslop] failed to resolve focused monitor :: ${error instanceof Error ? error.message : String(error)}`,
    )

    return monitors[0] ?? null
  }
}

export function isMonitor(value: Gdk.Monitor | null): value is Gdk.Monitor {
  return value !== null
}