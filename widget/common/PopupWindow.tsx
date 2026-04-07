import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import type Gtk from "gi://Gtk"
import { Reactive, normalizeMargins, PartialPopupMargins } from "./types"

export interface PopupWindowProps {
  name: string
  windowClass?: string
  namespace?: string
  gdkmonitor: Gdk.Monitor
  visible?: Reactive<boolean>
  anchor?: Astal.WindowAnchor
  layer?: Astal.Layer
  keymode?: Astal.Keymode
  exclusivity?: Astal.Exclusivity
  margin?: number | PartialPopupMargins
  opacity?: Reactive<number>
  setupWindow?: (window: Astal.Window) => void
  children?: any
}

export default function PopupWindow({
  name,
  windowClass,
  namespace,
  gdkmonitor,
  visible = true,
  anchor = Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT,
  layer = Astal.Layer.OVERLAY,
  keymode = Astal.Keymode.ON_DEMAND,
  exclusivity = Astal.Exclusivity.IGNORE,
  margin,
  opacity = 1,
  setupWindow,
  children,
}: PopupWindowProps) {
  const margins = normalizeMargins(margin)

  return (
    <window
      visible={visible}
      name={name}
      class={windowClass}
      namespace={namespace}
      gdkmonitor={gdkmonitor}
      anchor={anchor}
      layer={layer}
      keymode={keymode}
      exclusivity={exclusivity}
      opacity={opacity}
      marginTop={margins.top}
      marginRight={margins.right}
      marginBottom={margins.bottom}
      marginLeft={margins.left}
      application={app}
      $={setupWindow as ((widget: Gtk.Widget) => void) | undefined}
    >
      {children}
    </window>
  )
}