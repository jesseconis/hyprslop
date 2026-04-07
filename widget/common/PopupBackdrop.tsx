export interface PopupBackdropProps {
  className?: string
  children?: any
}

export default function PopupBackdrop({ className = "", children }: PopupBackdropProps) {
  const classes = ["popup-backdrop", className].filter(Boolean).join(" ")

  return (
    <box class={classes} hexpand vexpand>
      {children}
    </box>
  )
}