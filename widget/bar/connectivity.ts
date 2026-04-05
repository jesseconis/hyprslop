import { createPoll } from "ags/time"
import { readCommand } from "./common"

export type ConnectivitySnapshot = {
  wired: boolean
  wiredConnection: string
  wiredDevice: string
  wiredAddress: string
  wifiConnected: boolean
  wifiDevice: string
  wifiName: string
  wifiAddress: string
  bluetoothAvailable: boolean
  bluetoothPowered: boolean
  bluetoothConnections: number
}

export function createConnectivity() {
  return createPoll<ConnectivitySnapshot>(
    {
      wired: false,
      wiredConnection: "",
      wiredDevice: "",
      wiredAddress: "",
      wifiConnected: false,
      wifiDevice: "",
      wifiName: "",
      wifiAddress: "",
      bluetoothAvailable: false,
      bluetoothPowered: false,
      bluetoothConnections: 0,
    },
    5000,
    async () => {
      const networkOverview = await readCommand([
        "nmcli",
        "-t",
        "-f",
        "DEVICE,TYPE,STATE,CONNECTION",
        "device",
        "status",
      ])

      let wired = false
      let wiredConnection = ""
      let wiredDevice = ""
      let wifiConnected = false
      let wifiDevice = ""
      let wifiName = ""

      for (const entry of networkOverview.split("\n").filter(Boolean)) {
        const [device, type, state, ...connectionParts] = entry.split(":")
        const connection = connectionParts.join(":").trim()

        if (type === "ethernet" && state === "connected") {
          wired = true
          wiredDevice = device
          wiredConnection = connection
        }

        if (type === "wifi" && state === "connected") {
          wifiConnected = true
          wifiDevice = device
          wifiName = connection
        }
      }

      const [wiredAddress, wifiAddress, bluetoothStatus, bluetoothConnections] = await Promise.all([
        wiredDevice
          ? readCommand(["ip", "-brief", "address", "show", "dev", wiredDevice])
          : Promise.resolve(""),
        wifiDevice
          ? readCommand(["ip", "-brief", "address", "show", "dev", wifiDevice])
          : Promise.resolve(""),
        readCommand(["bluetoothctl", "show"]),
        readCommand(["bluetoothctl", "devices", "Connected"]),
      ])

      const bluetoothAvailable = bluetoothStatus.trim().length > 0
      const bluetoothPowered = /Powered:\s+yes/i.test(bluetoothStatus)
      const connectedDevices = bluetoothConnections
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean).length

      return {
        wired,
        wiredConnection,
        wiredDevice,
        wiredAddress: wiredAddress.trim(),
        wifiConnected,
        wifiDevice,
        wifiName,
        wifiAddress: wifiAddress.trim(),
        bluetoothAvailable,
        bluetoothPowered,
        bluetoothConnections: connectedDevices,
      }
    },
  )
}