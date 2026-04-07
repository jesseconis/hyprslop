import app from "ags/gtk4/app"
import { createRoot } from "gnim"
import style from "./style.scss"
import EmojiPicker from "./widget/EmojiPicker"
import { getFocusedMonitor, isMonitor } from "./widget/common/monitor"
import { DEBUG_ENABLED, perfLog } from "./widget/emoji/debug"

const INSTANCE_NAME = "hyprslop-emoji"

app.start({
  instanceName: INSTANCE_NAME,
  css: style,
  requestHandler(_argv, res) {
    res(`${INSTANCE_NAME} is already running`)
  },
  main() {
    perfLog("main-start")
    void getFocusedMonitor().then((monitor) => {
      if (!isMonitor(monitor)) {
        console.warn("No monitor available for emoji picker.")
        app.quit(1)
        return
      }

      if (DEBUG_ENABLED) {
        console.log(`[${INSTANCE_NAME}] creating picker on ${monitor.connector}`)
      }
      perfLog("monitor-resolved", `connector=${monitor.connector}`)

      createRoot((dispose) => {
        perfLog("root-created")
        const shutdownHandler = app.connect("shutdown", () => {
          app.disconnect(shutdownHandler)
          dispose()
        })

        EmojiPicker(monitor)
      })
    }).catch((error) => {
      console.warn(
        `[${INSTANCE_NAME}] failed to initialize :: ${error instanceof Error ? error.message : String(error)}`,
      )
      app.quit(1)
    })
  },
})