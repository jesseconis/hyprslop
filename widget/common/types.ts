import { Accessor } from "gnim"

export type Reactive<T> = T | Accessor<T>

export type PopupMargins = {
  top: number
  right: number
  bottom: number
  left: number
}

export type PartialPopupMargins = Partial<PopupMargins>

export function normalizeMargins(margin?: number | PartialPopupMargins): PopupMargins {
  if (typeof margin === "number") {
    return {
      top: margin,
      right: margin,
      bottom: margin,
      left: margin,
    }
  }

  return {
    top: margin?.top ?? 0,
    right: margin?.right ?? 0,
    bottom: margin?.bottom ?? 0,
    left: margin?.left ?? 0,
  }
}