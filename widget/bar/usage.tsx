import { createPoll } from "ags/time"
import { createComputed } from "gnim"
import { Module, readCommand, readMeminfoValue } from "./common"

type ResourceSnapshot = {
  cpu: number | null
  memory: number | null
  lastTotal: number
  lastIdle: number
}

export default function UsageModules() {
  const resources = createPoll<ResourceSnapshot>(
    { cpu: null, memory: null, lastTotal: 0, lastIdle: 0 },
    2000,
    async (previous) => {
      const output = await readCommand([
        "sh",
        "-c",
        "grep '^cpu ' /proc/stat; grep -E '^(MemTotal|MemAvailable):' /proc/meminfo",
      ])

      if (!output) return previous

      const [cpuLine = "", ...meminfoLines] = output.split("\n")
      const cpuFields = cpuLine
        .trim()
        .split(/\s+/)
        .slice(1)
        .map((value) => Number.parseInt(value, 10))
      const total = cpuFields.reduce((sum, value) => sum + value, 0)
      const idle = (cpuFields[3] ?? 0) + (cpuFields[4] ?? 0)
      const totalDiff = total - previous.lastTotal
      const idleDiff = idle - previous.lastIdle
      const cpu =
        previous.lastTotal > 0 && totalDiff > 0
          ? Math.max(0, Math.min(100, Math.round((1 - idleDiff / totalDiff) * 100)))
          : previous.cpu

      const meminfo = meminfoLines.join("\n")
      const totalMemory = readMeminfoValue(meminfo, "MemTotal")
      const availableMemory = readMeminfoValue(meminfo, "MemAvailable")
      const memory =
        totalMemory > 0
          ? Math.max(
              0,
              Math.min(100, Math.round(((totalMemory - availableMemory) / totalMemory) * 100)),
            )
          : previous.memory

      return {
        cpu,
        memory,
        lastTotal: total,
        lastIdle: idle,
      }
    },
  )

  const cpuLabel = createComputed(() => {
    const cpu = resources().cpu
    return cpu === null ? "--" : `${cpu}%`
  })

  const memoryLabel = createComputed(() => {
    const memory = resources().memory
    return memory === null ? "--" : `${memory}%`
  })

  return (
    <>
      <Module icon="" value={cpuLabel} className="module-cpu" tooltipText="CPU usage" />
      <Module icon="󰍛" value={memoryLabel} className="module-ram" tooltipText="Memory usage" />
    </>
  )
}