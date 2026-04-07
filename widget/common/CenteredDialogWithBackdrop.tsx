import { Astal, Gdk } from "ags/gtk4"
import { Accessor, Setter } from "gnim"
import PopupBackdrop from "./PopupBackdrop"
import PopupSurface from "./PopupSurface"
import PopupWindow from "./PopupWindow"
import { Reactive } from "./types"

export interface CenteredDialogWithBackdropProps {
  gdkmonitor: Gdk.Monitor
  windowName: string
  windowClass?: string
  namespace?: string
  width?: number
  height?: number
  x?: number
  y?: number
  opacity?: Reactive<number>
  open: Accessor<boolean> | boolean
  setOpen?: Setter<boolean>
  setupWindow?: (window: Astal.Window) => void
  children?: any
}

export default function CenteredDialogWithBackdrop({
  gdkmonitor,
  windowName,
  windowClass,
  namespace,
  width,
  height,
  x = 0,
  y = 0,
  opacity = 1,
  open,
  setupWindow,
  children,
}: CenteredDialogWithBackdropProps) {
  return (
    <PopupWindow
      name={windowName}
      windowClass={windowClass}
      namespace={namespace}
      gdkmonitor={gdkmonitor}
      visible={open}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      exclusivity={Astal.Exclusivity.IGNORE}
      setupWindow={setupWindow}
    >
      <PopupBackdrop>
        <PopupSurface className={windowClass ? `${windowClass}__surface` : ""} width={width} height={height} x={x} y={y} opacity={opacity}>
          {children}
        </PopupSurface>
      </PopupBackdrop>
    </PopupWindow>
  )
}