import Gtk from "gi://Gtk"
import { Reactive } from "./types"

export interface PopupSurfaceProps {
  className?: string
  width?: number
  height?: number
  x?: number
  y?: number
  opacity?: Reactive<number>
  halign?: Gtk.Align
  valign?: Gtk.Align
  children?: any
}

export default function PopupSurface({
  className = "",
  width,
  height,
  x = 0,
  y = 0,
  opacity = 1,
  halign = Gtk.Align.CENTER,
  valign = Gtk.Align.CENTER,
  children,
}: PopupSurfaceProps) {
  const classes = ["popup-surface", className].filter(Boolean).join(" ")

  return (
    <box
      class={classes}
      halign={halign}
      valign={valign}
      widthRequest={width}
      heightRequest={height}
      marginStart={x}
      marginTop={y}
      opacity={opacity}
      orientation={Gtk.Orientation.VERTICAL}
    >
      {children}
    </box>
  )
}