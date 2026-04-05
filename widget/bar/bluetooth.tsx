import { Accessor, createComputed } from "gnim"
import { Module } from "./common"
import type { ConnectivitySnapshot } from "./connectivity"

type BluetoothModuleProps = {
  connectivity: Accessor<ConnectivitySnapshot>
}

export default function BluetoothModule({ connectivity }: BluetoothModuleProps) {
  const bluetoothLabel = createComputed(() => {
    const status = connectivity()

    if (!status.bluetoothAvailable) return "N/A"
    if (!status.bluetoothPowered) return "OFF"
    if (status.bluetoothConnections > 0) return `${status.bluetoothConnections}`
    return "ON"
  })

  const bluetoothTooltip = createComputed(() => {
    const status = connectivity()

    if (!status.bluetoothAvailable) return "Bluetooth radio not detected"
    if (!status.bluetoothPowered) return "Bluetooth powered off"
    if (status.bluetoothConnections > 0) {
      return `${status.bluetoothConnections} connected bluetooth device(s)`
    }

    return "Bluetooth powered and ready"
  })

  return (
    <Module
      icon="󰂯"
      value={bluetoothLabel}
      className="module-bluetooth"
      tooltipText={bluetoothTooltip}
    />
  )
}