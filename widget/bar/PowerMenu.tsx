import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import { Accessor, Setter, createComputed, createState } from "gnim"
import Gtk from "gi://Gtk"
import Gio from "gi://Gio"
import PowerMenuButton from "./PowerButton"
import CenteredDialogWithBackdrop from "../common/CenteredDialogWithBackdrop"

const buttons = {
  "shutdown": { shortcut: "s", command: "sleep 1 && systemctl poweroff", iconName: "system-shutdown-symbolic" },
  "reboot": { shortcut: "r", command: "sleep 1 && systemctl reboot", iconName: "system-reboot-symbolic" },
  "lock": { shortcut: "o", command: "sleep 1 && nohup hyprlock >/dev/null 2>&1 &", iconName: "system-lock-screen-symbolic" },
  "logout": { shortcut: "g", command: "sleep 1 && hyprctl dispatch exit", iconName: "system-log-out-symbolic" },
  "pause": { shortcut: "p", command: "sleep 1 && (nohup hyprlock >/dev/null 2>&1 &) && sleep 1 && systemctl suspend", iconName: "media-playback-pause-symbolic" },
  "stop": { shortcut: "t", command: "sleep 1 && (nohup hyprlock >/dev/null 2>&1 &) && sleep 1 && systemctl hibernate", iconName: "media-playback-stop-symbolic" },
}

const buttonTypes = Object.keys(buttons) as Array<keyof typeof buttons>
const buttonKeyVals = buttonTypes.map((buttonType) => Gdk.keyval_from_name(buttons[buttonType].shortcut))

async function runCommand(command: string): Promise<void> {
  Gio.Subprocess.new(
    [
      "env",
      "-u",
      "BASH_ENV",
      "bash",
      "--noprofile",
      "--norc",
      "-c",
      `(${command}) >/dev/null 2>&1 &`,
    ],
    Gio.SubprocessFlags.NONE,
  )
}

export default function PowerMenu(
  gdkmonitor: Gdk.Monitor,
  powerMenuOpen: Accessor<boolean>,
  setPowerMenuOpen: Setter<boolean>
) {
  const [focusIndex, setFocusIndex] = createState(0)

  const setupWindow = (ref: Astal.Window) => {
    const keyController = Gtk.EventControllerKey.new()
    keyController.set_propagation_phase(Gtk.PropagationPhase.CAPTURE)
    keyController.connect("key-pressed", (_controller, keyval) => {
      const length = buttonTypes.length

      const index = buttonKeyVals.indexOf(Gdk.keyval_from_name(String.fromCharCode(keyval).toLowerCase()))
      if (index !== -1) {
        setFocusIndex(index)
        return true;
      } else if (49 <= keyval && keyval < 49 + length) {
        setFocusIndex(keyval % 49)
        return true;
      }

      switch (keyval) {
        case Gdk.KEY_Escape:
          setPowerMenuOpen(false)
          setFocusIndex(0)
          break;
        case Gdk.KEY_Right:
        case Gdk.KEY_L:
        case Gdk.KEY_l:
          setFocusIndex((focusIndex() + 1) % length)
          break;
        case Gdk.KEY_Left:
        case Gdk.KEY_H:
        case Gdk.KEY_h:
          setFocusIndex((focusIndex() + length - 1) %  length)
          break;
        case Gdk.KEY_Return:
        case Gdk.KEY_KP_Enter:
          setPowerMenuOpen(false)
          void runCommand(buttons[buttonTypes[focusIndex()]].command)
          break;
        default:
          break;
      }

      return false;
    })

    ref.add_controller(keyController)
  }

  return <CenteredDialogWithBackdrop
    gdkmonitor={gdkmonitor}
    windowName="power-menu"
    windowClass="PowerMenu"
    width={780}
    height={260}
    setupWindow={setupWindow}
    open={powerMenuOpen}
    setOpen={setPowerMenuOpen}
  >
    <box
      class="powermenu-dialog"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      $type="center"
    >
      {buttonTypes.map((buttonType, index) => (
        <PowerMenuButton
          iconName={buttons[buttonType].iconName}
          focus={createComputed(() => focusIndex() === index)}
          label={buttonType.replace(buttons[buttonType].shortcut, `[${buttons[buttonType].shortcut}]`)}
          onClick={(firstClick, secondClick) => {
            if (firstClick && secondClick) {
              setPowerMenuOpen(false)
              void runCommand(buttons[buttonType].command)
            } else if (firstClick) {
              setFocusIndex(index)
            }
          }}
        />
      ))}
    </box>
  </CenteredDialogWithBackdrop>
}