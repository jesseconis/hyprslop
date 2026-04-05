import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"

const BAR_OUTPUT = "HDMI-A-2"
const DEBUG_ENABLED = typeof DEBUG !== "undefined" && DEBUG
const INSTANCE_NAME = "hyprbar"

app.start({
  instanceName: INSTANCE_NAME,
  css: style,
  requestHandler(_argv, res) {
    res(`${INSTANCE_NAME} is already running`)
  },
  main() {
    if (DEBUG_ENABLED) {
      console.log(`[hyprbar] looking for monitor ${BAR_OUTPUT}`)
    }

    const monitor = app
      .get_monitors()
      .find((gdkmonitor) => gdkmonitor.connector === BAR_OUTPUT)

    if (monitor) {
      if (DEBUG_ENABLED) {
        console.log(`[hyprbar] creating bar on ${monitor.connector}`)
      }

      Bar(monitor)
    } else {
      if (DEBUG_ENABLED) {
        console.log(`[hyprbar] no monitor matched ${BAR_OUTPUT}`)
      }

      console.warn(`No monitor matched ${BAR_OUTPUT}; bar was not created.`)
    }
  },
})
