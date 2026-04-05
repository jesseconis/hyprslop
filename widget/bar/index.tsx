import app from "ags/gtk4/app"
import { Astal, Gdk, Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import BluetoothModule from "./bluetooth"
import { debugLog } from "./common"
import { createConnectivity } from "./connectivity"
import NetworkModules from "./network"
import UsageModules from "./usage"
import WorkspaceStrip from "./workspaces"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  debugLog(`bar initialized on ${gdkmonitor.connector}`)

  const clock = createPoll(
    "SYNCING CLOCK",
    1000,
    ["date", "+%a %d %b %Y // %H:%M:%S"],
  )

  const connectivity = createConnectivity()

  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox class="bar-shell" hexpand>
        <box $type="start" class="bar-side bar-left" hexpand halign={Gtk.Align.START}>
          <WorkspaceStrip />
        </box>

        <box $type="center" class="clock-module">
          <label class="clock-icon" label="󰥔" />
          <label class="clock-label" label={clock} />
        </box>

        <box $type="end" class="bar-side bar-right" hexpand halign={Gtk.Align.END}>
          <UsageModules />
          <NetworkModules connectivity={connectivity} />
          <BluetoothModule connectivity={connectivity} />
        </box>
      </centerbox>
    </window>
  )
}