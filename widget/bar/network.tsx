import { Accessor, createComputed } from "gnim"
import { Module, openNetworkEditor } from "./common"
import type { ConnectivitySnapshot } from "./connectivity"

type NetworkModulesProps = {
  connectivity: Accessor<ConnectivitySnapshot>
}

export default function NetworkModules({ connectivity }: NetworkModulesProps) {
  const wiredLabel = createComputed(() => (connectivity().wired ? "UP" : "DOWN"))

  const wiredTooltip = createComputed(() => {
    const status = connectivity()

    if (!status.wired) {
      return "Ethernet offline\nClick to open nm-connection-editor"
    }

    return [
      `Ethernet: ${status.wiredDevice || "unknown"}`,
      status.wiredConnection ? `Profile: ${status.wiredConnection}` : "Profile: connected",
      status.wiredAddress || "No IP address assigned",
      "Click to open nm-connection-editor",
    ].join("\n")
  })

  const wifiLabel = createComputed(() => {
    const status = connectivity()

    if (!status.wifiConnected) return "OFF"
    if (!status.wifiName) return "ON"
    return status.wifiName
  })

  const wifiTooltip = createComputed(() => {
    const status = connectivity()

    if (!status.wifiConnected) {
      return "Wi-Fi offline\nClick to open nm-connection-editor"
    }

    return [
      `Wi-Fi: ${status.wifiDevice || "unknown"}`,
      status.wifiName ? `SSID: ${status.wifiName}` : "SSID unavailable",
      status.wifiAddress || "No IP address assigned",
      "Click to open nm-connection-editor",
    ].join("\n")
  })

  return (
    <>
      <Module
        icon="󰈀"
        value={wiredLabel}
        className="module-ethernet"
        tooltipText={wiredTooltip}
        onClicked={openNetworkEditor}
      />
      <Module
        icon="󰖩"
        value={wifiLabel}
        className="module-wifi"
        tooltipText={wifiTooltip}
        onClicked={openNetworkEditor}
      />
    </>
  )
}