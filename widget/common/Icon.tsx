import { Reactive } from "./types"

export interface IconProps {
  iconName?: Reactive<string>
  file?: string
  className?: string
  pixelSize?: number
  widthRequest?: number
  heightRequest?: number
}

export default function Icon({
  iconName,
  file,
  className = "",
  pixelSize,
  widthRequest,
  heightRequest,
}: IconProps) {
  const classes = ["shared-icon", className].filter(Boolean).join(" ")

  if (file) {
    return (
      <image
        class={classes}
        file={file}
        pixelSize={pixelSize}
        widthRequest={widthRequest}
        heightRequest={heightRequest}
      />
    )
  }

  return (
    <image
      class={classes}
      iconName={iconName}
      pixelSize={pixelSize}
      widthRequest={widthRequest}
      heightRequest={heightRequest}
      useFallback
    />
  )
}