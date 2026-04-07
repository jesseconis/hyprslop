import Gtk from "gi://Gtk"

export interface PopupHeaderProps {
  title: string
  subtitle?: string
  trailing?: any
}

export default function PopupHeader({ title, subtitle, trailing }: PopupHeaderProps) {
  return (
    <centerbox class="popup-header">
      <box $type="start" class="popup-header-copy" orientation={Gtk.Orientation.VERTICAL}>
        <label class="popup-title" xalign={0} label={title} />
        {subtitle ? <label class="popup-subtitle" xalign={0} label={subtitle} /> : null}
      </box>
      <box $type="end" class="popup-header-trailing">
        {trailing}
      </box>
    </centerbox>
  )
}